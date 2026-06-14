// figma-to-json-plus/helpers/emit-components-builder.mjs
// Builds tiers/components.json from a normalized figma-snapshot.json.
// Filters by a COMPONENTS allowlist, maps PascalCase component names to
// camelCase keys, and preserves hand-authored $extensions.

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TreeUtils } from './utils-tree.mjs';
import { DtcgFormatter } from './utils-dtcg-formatter.mjs';

const OUT_PATH        = fileURLToPath(new URL('../../../tiers/components.json', import.meta.url));
const PRIMITIVES_PATH = fileURLToPath(new URL('../../../tiers/primitives.json', import.meta.url));
const SEMANTICS_PATH  = fileURLToPath(new URL('../../../tiers/semantics.json', import.meta.url));

// Components to emit — PascalCase Figma names. Pass a subset via constructor.
const DEFAULT_COMPONENTS = [
  'Breadcrumb', 'Button', 'ButtonIcon', 'Checkbox', 'InputText',
  'SidebarPrimary', 'SidebarSecondary', 'Switch', 'Tag',
];

// Interaction state sort order.
const STATE_ORDER = ['idle', 'hover', 'active', 'focus', 'disabled', 'error', 'selected', 'checked', 'indeterminate'];
// Color-related leaf key order.
const COLOR_ORDER = ['color', 'background', 'border', 'fill', 'stroke', 'shadow'];

// No case transformation: Figma segment names are preserved exactly as-is.
// Components and SubComponents are PascalCase in Figma; everything else is camelCase.
// The emitter must not change casing at any level.

export class ComponentsEmitter {
  #snapshot;
  #primitives;
  #semantics;
  #allowlist;

  constructor(snapshot, { components = DEFAULT_COMPONENTS } = {}) {
    this.#snapshot = snapshot;
    this.#primitives = JSON.parse(fs.readFileSync(PRIMITIVES_PATH, 'utf8'));
    this.#semantics  = JSON.parse(fs.readFileSync(SEMANTICS_PATH, 'utf8'));
    this.#allowlist  = new Set(components);
  }

  emit() {
    const prevOut = fs.existsSync(OUT_PATH)
      ? JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'))
      : {};

    const out = { $schema: '../schemas/tokens.schema.json' };
    // Preserve hand-authored $extensions (e.g. com.acronis.tailwindRoles).
    if (prevOut.$extensions) out.$extensions = prevOut.$extensions;

    const componentsNode = this.#snapshot.variables?.brand?.components;
    if (!componentsNode) throw new Error('Snapshot missing brand.components subtree.');

    for (const [figmaName, subtree] of Object.entries(componentsNode)) {
      if (figmaName.startsWith('$')) continue;
      if (!this.#allowlist.has(figmaName)) continue;

      out[figmaName] = this.#emitComponent(figmaName, subtree);
    }

    const sorted = TreeUtils.sortNode(out);
    // Re-attach hand-authored $extensions verbatim (sortNode may have reordered internals).
    if (prevOut.$extensions) sorted.$extensions = prevOut.$extensions;
    const root = TreeUtils.reorderByList(sorted, ['$schema', '$extensions', ...DEFAULT_COMPONENTS]);

    fs.writeFileSync(OUT_PATH, DtcgFormatter.serialize(root));
    return root;
  }

  get outputPath() { return OUT_PATH; }

  #emitComponent(figmaName, subtree) {
    const result = {};
    this.#walk(subtree, result);
    return result;
  }

  #walk(node, out, depth = 0) {
    if (!node || typeof node !== 'object') return;

    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (!v || typeof v !== 'object') continue;

      if ('$value' in v || '$extensions' in v) {
        // Leaf token. Figma segment names are already camelCase — use as-is.
        out[k] = this.#buildLeaf(v);
      } else {
        // Group. Figma segment names are already camelCase — use as-is.
        out[k] = {};
        this.#walk(v, out[k], depth + 1);
        // Reorder interaction states if this group looks like a variant container.
        out[k] = TreeUtils.reorderByList(out[k], STATE_ORDER);
      }
    }
  }

  #buildLeaf(leaf) {
    const variableId = leaf.$extensions?.['figma-console-mcp']?.variableId
      ?? leaf.$extensions?.['com.figma.variableId'];

    // Resolve $value: if it's an alias, translate it.
    let value = leaf.$value;
    if (typeof value === 'string' && value.startsWith('{')) {
      value = this.#translateAlias(value, variableId);
    }

    const token = {};
    if (leaf.$type) token.$type = leaf.$type;
    token.$value = value;

    // Build extensions.
    const ext = {};
    const figmaExt = leaf.$extensions?.['figma-console-mcp'] ?? {};
    const cleanExt = leaf.$extensions ?? {};
    const id = figmaExt.variableId ?? cleanExt['com.figma.variableId'];
    if (id) ext['com.figma.variableId'] = id;

    const scopes = cleanExt['com.figma.scopes'] ?? figmaExt.scopes;
    if (scopes) ext['com.figma.scopes'] = scopes;
    if (cleanExt['com.figma.hiddenFromPublishing']) ext['com.figma.hiddenFromPublishing'] = true;

    // Multi-mode values.
    const modes = cleanExt.modes ?? {};
    const lastSynced = figmaExt.lastSyncedValue ?? {};
    const allModes = { ...modes };
    for (const [modeKey, modeData] of Object.entries(lastSynced)) {
      if ('reference' in modeData) allModes[modeKey] = modeData.reference;
      else if ('literal' in modeData) allModes[modeKey] = modeData.literal;
    }

    if (Object.keys(allModes).length > 0) {
      const translatedValues = {};
      for (const [modeKey, modeRef] of Object.entries(allModes)) {
        const normalizedKey = modeKey.toLowerCase().replace(/\s+/g, '-');
        if (typeof modeRef === 'string' && modeRef.startsWith('{')) {
          try {
            translatedValues[normalizedKey] = this.#translateAlias(modeRef, id);
          } catch {
            translatedValues[normalizedKey] = modeRef;
          }
        } else {
          translatedValues[normalizedKey] = modeRef;
        }
      }
      if (Object.keys(translatedValues).length > 0) token.values = translatedValues;
    }

    if (Object.keys(ext).length > 0) token.$extensions = ext;
    return token;
  }

  #translateAlias(alias, variableId) {
    // Try semantic colors first: "semantics.colors.background.surface.primary" → "{colors.background.surface.primary}"
    const semanticMatch = alias.match(/^\{brand\.semantics\.(.+)\}$/);
    if (semanticMatch) {
      const innerPath = semanticMatch[1].replace(/\./g, '.').replace(/\s+/g, '-');
      return `{${innerPath}}`;
    }

    // Palette alias: "{Base}", "{Blue.Blue-3}", "{__library:VariableID:…}"
    if (alias.includes('__library:VariableID') || /^\{[A-Z]/.test(alias)) {
      // Delegate to the shared alias translator logic inline.
      // (Avoid importing AliasTranslator to keep this self-contained.)
      const orphanMatch = alias.match(/^\{__library:(VariableID:[^}]+)\}$/);
      if (orphanMatch) {
        const varId = orphanMatch[1];
        const path = this.#findPathByVarId(this.#primitives, varId);
        if (path) return `{${path}}`;
      }
      const inner = alias.slice(1, -1);
      const parts = inner.split('.');
      // Simple: just use the raw alias as-is if we can't map it.
      return alias;
    }

    return alias;
  }

  #findPathByVarId(node, varId, base = []) {
    if (!node || typeof node !== 'object') return null;
    if (node.$extensions?.['com.figma.variableId'] === varId) return base.join('.');
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      const found = this.#findPathByVarId(v, varId, [...base, k]);
      if (found) return found;
    }
    return null;
  }
}

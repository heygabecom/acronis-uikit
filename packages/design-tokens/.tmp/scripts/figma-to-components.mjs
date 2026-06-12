#!/usr/bin/env node
// Convert the Figma DTCG export into tiers/components.json — per-component
// tokens that alias semantic colors/gradients/typography (and primitive units),
// inheriting the Brand mode dimension from semantics (today: acronis; more
// brands later).
//
// Usage: node .tmp/scripts/figma-to-components.mjs [export-file]
//   export-file defaults to ./.tmp/figma-tokens/variables.tokens.json
//   (the path produced by figma-console MCP's figma_export_tokens).
//
// Scope: only the components in the COMPONENTS allowlist are emitted. The Figma
// `brand.components` group also carries components that are out of scope for now
// (MenuItem, Tooltip); they flow in via future syncs by adding them here. The
// legacy `brand.componentLegacy` group is ignored entirely.
//
// Output has no outer "components" wrapper — components are root groups
// (button, button-icon, sidebar-primary, …). $type lives on each leaf because
// components mix `color`, `dimension`, `gradient`, `typography`, `strokeStyle`
// and `string`. Every leaf carries `$extensions.com.figma.variableId`.
//
// Naming: Figma PascalCase/camelCase names canonicalize to kebab-case code
// paths (Button → button, ButtonIcon → button-icon, borderColor → border-color,
// paddingX → padding-x, …). `_global` is preserved verbatim (sorts first). The
// Figma structure already nests interaction states (color/idle, color/hover, …)
// and has real `_global` groups, so no flattening/regrouping is needed — only
// the fixed state ordering (idle → hover → active → disabled) is reapplied
// after the alphabetic sort.
//
// Depends on tiers/primitives.json AND tiers/semantics.json being current —
// the alias-map validator checks every translated alias target (colors, units,
// gradients, typography) against those trees and fails on unknown targets. Run
// figma-to-semantic.mjs first so the gradients root exists when this validates.
//
// Mocked values (Figma technical limitations, decoded here):
//   - #FF00FF00 / #FFFFFF00 color literals → CSS `transparent`
//     ({ colorSpace:'hsl', components:[0,0,0], alpha:0 }).
//   - `string` variables holding `typography.*` → $type:'typography' aliasing
//     the semantic composite ({typography.body.strong}, …).
//   - `string` variables referencing semantic.gradients.* → $type:'gradient'
//     aliasing the gradients root ({gradients.ai.idle}, …).
//   - `borderStyle` string variables → $type:'strokeStyle' (value "solid").
//   - per-state `textDecoration` string variables → $type:'string'
//     (value "none"/"underline"; the documented schema divergence).

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadDtcg, loadMeta } from './lib/paths.mjs';
import { makeMetaFor } from './lib/meta.mjs';
import { hexToHslValue } from './lib/color.mjs';
import { setPath, sortNode, reorderByList } from './lib/tree.mjs';
import { formatDtcgJson } from './lib/format.mjs';
import { makeAliasTranslator } from './lib/alias-map.mjs';

// Components emitted by this sync. Out-of-scope Figma components are added here
// as their own syncs land.
const COMPONENTS = [
  'Breadcrumb',
  'Button',
  'ButtonIcon',
  'Checkbox',
  'Input',
  'SidebarPrimary',
  'SidebarSecondary',
  'Switch',
  'Tag',
];

const { path: srcPath, source } = loadDtcg(process.argv);
const figmaComponents = source.brand?.components;
if (!figmaComponents) throw new Error(`source ${srcPath} has no brand.components subtree.`);

const OUT = fileURLToPath(new URL('../../tiers/components.json', import.meta.url));
const PRIMITIVES = fileURLToPath(new URL('../../tiers/primitives.json', import.meta.url));
const SEMANTIC = fileURLToPath(new URL('../../tiers/semantics.json', import.meta.url));
const primitives = JSON.parse(fs.readFileSync(PRIMITIVES, 'utf8'));
const semantic = JSON.parse(fs.readFileSync(SEMANTIC, 'utf8'));

const metaFor = makeMetaFor(loadMeta());
const aliasMap = makeAliasTranslator({ primitives, semantic });

const fcExt = leaf => leaf?.$extensions?.['figma-console-mcp'] ?? {};
// Figma names are PascalCase ("ButtonIcon") or camelCase ("borderColor"); split
// camel-humps then lower-and-hyphenate. `_global` is handled by the caller.
const kebab = k => k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
// Mode keys come from Figma as title-case ("Acronis", "Brand B"). Lower-case
// and hyphenate so they're kebab-stable in our output.
const normalizeMode = m => m.toLowerCase().replace(/\s+/g, '-');

// #FF00FF00 (magenta-0) and #FFFFFF00 (white-0) are both mocks for `transparent`.
const TRANSPARENT = { colorSpace: 'hsl', components: [0, 0, 0], alpha: 0 };
const TRANSPARENT_MOCKS = new Set(['#FF00FF00', '#FFFFFF00']);

const aliasErrors = [];
const rawValueWarnings = [];

function translateRef(figmaAlias, leafPath) {
  const codeAlias = aliasMap.translate(figmaAlias);
  if (!aliasMap.has(codeAlias)) aliasErrors.push(`${leafPath}: unknown alias target ${codeAlias} (from Figma ${figmaAlias})`);
  return codeAlias;
}

// textStyle string variables hold a bare our-path literal ("typography.body.strong");
// wrap it as an alias and validate the target exists in semantic.typography.
function typographyAlias(literal, leafPath) {
  const codeAlias = `{${literal}}`;
  if (!aliasMap.has(codeAlias)) aliasErrors.push(`${leafPath}: unknown typography target ${codeAlias}`);
  return codeAlias;
}

// Preserve hand-authored root-level $extensions (e.g. com.acronis.tailwindRoles,
// the build-time Tailwind routing hints) — these are not derived from Figma, so
// carry them forward from the existing tier file rather than dropping them on
// re-emit. sortNode keeps $extensions right after $schema (META_ORDER).
const prevRoot = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const out = { $schema: '../schemas/tokens.schema.json' };
if (prevRoot.$extensions) out.$extensions = prevRoot.$extensions;

let count = 0;
function emitLeaf(figmaPath, codePath, leaf) {
  const leafPath = figmaPath.join('.');
  const figmaKey = figmaPath[figmaPath.length - 1];
  const variableId = fcExt(leaf).variableId;
  const lastSynced = fcExt(leaf).lastSyncedValue ?? {};
  let $type = leaf.$type;
  const values = {};
  for (const [figmaModeKey, modeData] of Object.entries(lastSynced)) {
    const modeKey = normalizeMode(figmaModeKey);
    if (leaf.$type === 'string') {
      // Figma `string` variables stand in for several DTCG types Figma can't
      // represent as native variables — discriminate by payload/position.
      if ('reference' in modeData && modeData.reference.includes('semantics.gradients')) {
        $type = 'gradient';
        values[modeKey] = translateRef(modeData.reference, leafPath);
      } else if ('literal' in modeData && /^typography\./.test(modeData.literal)) {
        $type = 'typography';
        values[modeKey] = typographyAlias(modeData.literal, leafPath);
      } else if (figmaKey === 'borderStyle') {
        $type = 'strokeStyle';
        values[modeKey] = modeData.literal;
      } else if (figmaPath.includes('textDecoration')) {
        $type = 'string';
        values[modeKey] = modeData.literal;
      } else {
        throw new Error(`${leafPath}: unrecognized string variable (value ${JSON.stringify(modeData)})`);
      }
    } else if ('reference' in modeData) {
      values[modeKey] = translateRef(modeData.reference, leafPath);
    } else if ('literal' in modeData) {
      if (leaf.$type === 'color' && TRANSPARENT_MOCKS.has(modeData.literal.toUpperCase())) {
        values[modeKey] = TRANSPARENT;
      } else if (leaf.$type === 'color') {
        rawValueWarnings.push(`${leafPath}: raw ${modeData.literal} has no matching semantic — inlined as HSL`);
        values[modeKey] = hexToHslValue(modeData.literal);
      } else {
        throw new Error(`${leafPath}: cannot inline literal for $type=${leaf.$type}: ${modeData.literal}`);
      }
    } else {
      throw new Error(`${leafPath}: lastSyncedValue mode has neither reference nor literal`);
    }
  }
  const meta = metaFor(variableId);
  const ext = {
    'com.figma.scopes': meta.scopes,
    'com.figma.variableId': variableId,
  };
  if (meta.hidden) ext['com.figma.hiddenFromPublishing'] = true;
  setPath(out, codePath, { $type, values, platforms: ['PD'], $extensions: ext });
  count++;
}

for (const comp of COMPONENTS) {
  const node = figmaComponents[comp];
  if (!node) throw new Error(`source ${srcPath} has no brand.components.${comp} — check the allowlist.`);
  (function walk(n, figmaPath, codePath) {
    if (!n || typeof n !== 'object') return;
    if ('$value' in n) { emitLeaf(figmaPath, codePath, n); return; }
    for (const [k, v] of Object.entries(n)) {
      if (k.startsWith('$')) continue;
      walk(v, [...figmaPath, k], [...codePath, k === '_global' ? k : kebab(k)]);
    }
  })(node, [comp], [kebab(comp)]);
}

if (aliasErrors.length) {
  console.error('Alias errors:');
  for (const e of aliasErrors) console.error('  -', e);
  process.exit(1);
}

if (rawValueWarnings.length) {
  console.warn('Component alias gaps (raw values inlined):');
  for (const w of rawValueWarnings) console.warn('  -', w);
}

const sorted = sortNode(out);

// sortNode alphabetised the interaction-state keys (active, disabled, hover,
// idle). Walk every state-only group and reorder to STATE_ORDER in place.
const STATE_ORDER = ['idle', 'hover', 'active', 'disabled'];
(function reorderStates(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  const keys = Object.keys(node).filter(k => !k.startsWith('$'));
  if (keys.length > 0 && keys.every(k => STATE_ORDER.includes(k))) {
    for (const s of STATE_ORDER) if (s in node) { const v = node[s]; delete node[s]; node[s] = v; }
  }
  for (const k of Object.keys(node)) { if (!k.startsWith('$')) reorderStates(node[k]); }
})(sorted);

// Per-component variant ordering follows the design-system structure rather
// than alphabetical. `_global` already sorts to the front via sortNode.
if (sorted.button) sorted.button = reorderByList(sorted.button, ['_global', 'primary', 'secondary', 'ghost', 'destructive', 'inverted', 'ai']);
if (sorted['button-icon']) sorted['button-icon'] = reorderByList(sorted['button-icon'], ['_global', 'primary', 'secondary', 'ghost']);
for (const sb of ['sidebar-primary', 'sidebar-secondary']) {
  if (sorted[sb]) sorted[sb] = reorderByList(sorted[sb], ['_global', 'expanded', 'collapsed', 'menu-item', 'menu-item-extras', 'section']);
}

// Restore the hand-authored $extensions verbatim — sortNode alphabetised its
// inner keys; reassigning keeps the post-$schema position but the authored order.
if (prevRoot.$extensions) sorted.$extensions = prevRoot.$extensions;

fs.writeFileSync(OUT, formatDtcgJson(sorted) + '\n');
console.log(`Wrote ${OUT}: ${count} leaves across ${COMPONENTS.length} components (${rawValueWarnings.length} raw-value gaps inlined)`);

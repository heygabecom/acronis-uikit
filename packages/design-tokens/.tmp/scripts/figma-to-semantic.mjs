#!/usr/bin/env node
// Convert the Figma DTCG export into tiers/semantics.json — semantic colors
// that alias palette primitives, plus a semantic typography subtree derived
// from figma/styles-text.json that aliases typography primitives.
//
// Usage: node .tmp/scripts/figma-to-semantic.mjs [export-file]
//   export-file defaults to ./figma/variables.tokens.json
//   (the path produced by figma-console MCP's figma_export_tokens).
//
// The output has no outer "semantic" wrapper — just `colors.{background,text,
// glyph,border}`, a `gradients.*` root, and `typography.{headings,body,link,
// caption,note,fineprint}`. Every variable-backed color/gradient leaf carries
// `$extensions.com.figma.variableId`. Typography leaves carry
// `$extensions.com.figma.styleId` instead. Downstream tooling can discriminate
// by which key is present.
//
// Gradients: Figma variables can't hold gradient fills, so the four AI gradients
// are mocked as `string` variables under brand.semantic.gradients, each holding
// a CSS `linear-gradient(...)`. We parse the stops into DTCG `gradient` arrays
// and keep the raw CSS string in `$extensions.com.figma.cssGradient`.
//
// Depends on tiers/primitives.json being current — palette VariableID lookup
// validates that every Figma alias target maps to a real token in our tree,
// and typography primitives (font-family, font-size, font-weight, line-height,
// letter-spacing) feed the value→alias map for the typography subtree.
//
// Input  (figma/variables.tokens.json):
//   brand.color.background.surface.primary
//     → { $type: "color", $value: "{Base}",
//          $extensions["figma-console-mcp"].variableId: "VariableID:50:1426" }
//   brand.color.background.inverted.primary
//     → { $value: "{__library:VariableID:139:23}", ... }   // orphan ref
//
// Input  (figma/styles-text.json):
//   { name: "body/body-heading", fontName: {family,style}, fontSize, lineHeight,
//     letterSpacing, textCase, textDecoration, id: "S:1e65…" }
//
// Output (tiers/semantics.json):
//   colors.background.surface.primary
//     → { values: { acronis: "{palette.base}" },
//         platforms: ["PD"],
//         $extensions: { com.figma.{scopes,variableId} } }
//   colors.background.inverted.primary
//     → { values: { acronis: "{palette.transparent.inverted.6}" }, platforms: ["PD"], ... }
//   typography.body.heading
//     → { $value: { fontFamily:"{…default}", fontSize:"{…14}", fontWeight:"{…semibold}",
//                   lineHeight:"{…24}", letterSpacing:"{…0-3}" },
//         platforms: ["PD"],
//         $extensions: { com.acronis.textCase:"UPPER", com.figma.styleId:"S:1e65…" } }

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadDtcg, loadMeta } from './lib/paths.mjs';
import { makeMetaFor } from './lib/meta.mjs';
import { round, hexToHslValue } from './lib/color.mjs';
import { mapPaletteParts } from './lib/palette-map.mjs';
import { setPath, collectColorLeaves, sortNode, reorderByList } from './lib/tree.mjs';
import { formatDtcgJson } from './lib/format.mjs';
import { makeTypographyMap, styleToWeight, mapTextStyleName } from './lib/typography-map.mjs';

const TEXT_STYLES_PATH = fileURLToPath(new URL('../../.tmp/figma-tokens/styles-text.json', import.meta.url));

const { path: srcPath, source } = loadDtcg(process.argv);
const figmaBrandColor = source.brand?.semantic?.colors;
if (!figmaBrandColor) throw new Error(`source ${srcPath} has no brand.semantic.colors subtree.`);

const OUT = fileURLToPath(new URL('../../tiers/semantics.json', import.meta.url));
const PRIMITIVES = fileURLToPath(new URL('../../tiers/primitives.json', import.meta.url));
const primitives = JSON.parse(fs.readFileSync(PRIMITIVES, 'utf8'));
const metaFor = makeMetaFor(loadMeta());

// ---------- palette lookup ----------
// Figma path like "Blue.Blue-3" → our path "blue.3". Single-element (e.g.
// "Base") just lowercases; multi-element shares the canonical mapper.
function translatePaletteParts(parts) {
  if (parts.length === 1) return [parts[0].toLowerCase()];
  return mapPaletteParts(parts);
}

// Reverse map: palette VariableID → our path ("palette.transparent.inverted.6").
// Used to resolve `{__library:VariableID:X:Y}` orphan refs that Figma emits
// when a brand var aliases a palette variable not present in the local Mode
// collection (e.g. Transparent/Inverted-6 and -8 come in as orphan refs).
const VARID_TO_PATH = (() => {
  const map = new Map();
  (function walk(node, base) {
    if (!node || typeof node !== 'object') return;
    const variableId = node?.$extensions?.['com.figma.variableId'];
    if (variableId && (base.length === 1 || base.length >= 2)) {
      map.set(variableId, base.join('.'));
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      walk(v, [...base, k]);
    }
  })(primitives.palette, ['palette']);
  return map;
})();

// Translate Figma alias → our alias. Three input shapes:
//   - "{Base}" / "{Blue.Blue-3}"   — local Mode reference (now bare, post-rename)
//   - "{__library:VariableID:X:Y}" — orphan/library ref, resolved via VARID_TO_PATH
function translateAlias(figmaAlias) {
  const orphan = figmaAlias.match(/^\{__library:(VariableID:[^}]+)\}$/);
  if (orphan) {
    const ourPath = VARID_TO_PATH.get(orphan[1]);
    if (!ourPath) throw new Error(`orphan VariableID ${orphan[1]} not found in tiers/primitives.json — refresh primitives first.`);
    return `{${ourPath}}`;
  }
  const m = figmaAlias.match(/^\{([^}]+)\}$/);
  if (!m) throw new Error(`expected palette alias, got ${figmaAlias}`);
  const ourParts = translatePaletteParts(m[1].split('.'));
  return `{palette.${ourParts.join('.')}}`;
}

// Validate the our-path actually exists in tiers/primitives.json.
function paletteHas(ourPath) {
  let cur = primitives.palette;
  for (const k of ourPath.split('.')) {
    if (!cur || typeof cur !== 'object' || !(k in cur)) return false;
    cur = cur[k];
  }
  return true;
}

const fcExt = leaf => leaf?.$extensions?.['figma-console-mcp'] ?? {};
const normalizeKey = k => k.replace(/\s+/g, '-');
// Mode keys come from Figma as title-case ("Acronis", "Brand B"). Lower-case
// and hyphenate so they're kebab-stable in our output.
const normalizeMode = m => m.toLowerCase().replace(/\s+/g, '-');

// Parse a mocked CSS `linear-gradient(<angle>, <hex> <pct>%, …)` into a DTCG
// gradient stop array. The angle is dropped here (kept verbatim in the raw
// string under com.figma.cssGradient); only the color stops are structured.
function parseCssGradient(css) {
  const m = css.trim().replace(/;$/, '').match(/^linear-gradient\(([^)]+)\)$/);
  if (!m) throw new Error(`unparseable gradient: ${css}`);
  const parts = m[1].split(',').map(s => s.trim());
  const angle = parts.shift();
  if (!/^\d+deg$/.test(angle)) throw new Error(`unexpected gradient angle: ${angle}`);
  return parts.map(p => {
    const sm = p.match(/^(#[0-9A-Fa-f]{6})\s+([\d.]+)%$/);
    if (!sm) throw new Error(`unparseable gradient stop: ${p}`);
    return { color: hexToHslValue(sm[1]), position: round(Number(sm[2]) / 100, 4) };
  });
}

// ---------- build output ----------
const out = {
  $schema: '../schemas/tokens.schema.json',
  colors: { $type: 'color' },
};

// 1. Variable-backed semantic colors from the DTCG export.
// Mode iteration is data-driven: every brand mode that appears in
// lastSyncedValue is emitted (today: Acronis; soon: Brand B and more).
let count = 0;
const aliasErrors = [];
for (const { path, leaf } of collectColorLeaves(figmaBrandColor)) {
  const variableId = fcExt(leaf).variableId;
  const lastSynced = fcExt(leaf).lastSyncedValue ?? {};
  if (Object.keys(lastSynced).length === 0) {
    aliasErrors.push(`no lastSyncedValue modes at ${path.join('.')}`);
    continue;
  }
  const values = {};
  for (const [figmaModeKey, modeData] of Object.entries(lastSynced)) {
    if (!('reference' in modeData)) {
      aliasErrors.push(`${path.join('.')} mode ${figmaModeKey}: expected reference, got ${JSON.stringify(modeData)}`);
      continue;
    }
    const ourAlias = translateAlias(modeData.reference);
    const targetPath = ourAlias.slice(1, -1).split('.').slice(1).join('.');
    if (!paletteHas(targetPath)) aliasErrors.push(`unknown palette target: ${ourAlias} (from ${path.join('.')} mode ${figmaModeKey})`);
    values[normalizeMode(figmaModeKey)] = ourAlias;
  }
  const meta = metaFor(variableId);
  const ourKey = path.map(normalizeKey);
  const ext = {
    'com.figma.scopes': meta.scopes,
    'com.figma.variableId': variableId,
  };
  if (meta.hidden) ext['com.figma.hiddenFromPublishing'] = true;
  setPath(out.colors, ourKey, { values, platforms: ['PD'], $extensions: ext });
  count++;
}

// 2. AI gradients from brand.semantic.gradients — Figma variables can't store
// gradient fills, so the designer mocks them as `string` variables holding a
// CSS `linear-gradient(...)`. We parse the stops into DTCG `gradient` arrays
// (hex → HSL, percent → 0..1 position) and preserve the raw CSS string in
// $extensions.com.figma.cssGradient (it also carries the angle, which DTCG
// gradient has no field for). Single-keyed under `acronis` like every semantic.
const figmaGradients = source.brand?.semantic?.gradients;
out.gradients = { $type: 'gradient' };
let gradientCount = 0;
if (figmaGradients) {
  for (const [group, tokens] of Object.entries(figmaGradients)) {
    if (group.startsWith('$')) continue;
    out.gradients[group] = {};
    for (const [key, leaf] of Object.entries(tokens)) {
      if (key.startsWith('$')) continue;
      const variableId = fcExt(leaf).variableId;
      const lastSynced = fcExt(leaf).lastSyncedValue ?? {};
      const values = {};
      let raw = null;
      for (const [figmaModeKey, modeData] of Object.entries(lastSynced)) {
        if (!('literal' in modeData)) {
          aliasErrors.push(`gradients.${group}.${key} mode ${figmaModeKey}: expected literal CSS gradient, got ${JSON.stringify(modeData)}`);
          continue;
        }
        raw = modeData.literal;
        values[normalizeMode(figmaModeKey)] = parseCssGradient(modeData.literal);
      }
      const meta = metaFor(variableId);
      out.gradients[group][key] = {
        values,
        platforms: ['PD'],
        $extensions: {
          'com.figma.scopes': meta.scopes,
          'com.figma.variableId': variableId,
          'com.figma.cssGradient': raw,
        },
      };
      gradientCount++;
    }
  }
}

if (aliasErrors.length) {
  console.error('Alias errors:');
  for (const e of aliasErrors) console.error('  -', e);
  process.exit(1);
}

// 3. Typography from figma/styles-text.json — DTCG composite tokens, each leaf
// aliasing typography primitives. Single-value (no mode dimension): the
// composite goes on $value directly, not wrapped in com.acronis.modes.
// Non-DTCG fields (textCase, textDecoration) are preserved under com.acronis.*.
const textStyles = JSON.parse(fs.readFileSync(TEXT_STYLES_PATH, 'utf8')).styles ?? [];
const typoMap = makeTypographyMap(primitives);
const rawValueWarnings = [];

function aliasOrThrow(alias, field, value, styleName) {
  if (alias !== null) return alias;
  throw new Error(`text style "${styleName}": no primitive for ${field}=${JSON.stringify(value)} — extend primitives.json`);
}

function aliasOrInline(alias, px, field, styleName) {
  if (alias !== null) return alias;
  rawValueWarnings.push(`${styleName}: ${field} ${px}px has no matching primitive — inlined raw dimension`);
  return { unit: 'px', value: px };
}

out.typography = { $type: 'typography' };
let typoCount = 0;
for (const style of textStyles) {
  // Filter out _library/* placeholders — Figma keeps them in the file but
  // they're not part of the semantic typography surface.
  if (style.name.startsWith('_library/')) continue;
  const ourPath = mapTextStyleName(style.name);
  const family = style.fontName?.family;
  const weight = styleToWeight(style.fontName?.style);
  if (style.lineHeight?.unit !== 'PIXELS') throw new Error(`text style "${style.name}" lineHeight unit ${style.lineHeight?.unit} not supported — only PIXELS`);
  // 0 in any unit collapses to 0 px — matches the normalization in
  // figma-to-primitives.mjs (PERCENT shows up on the 2 link styles).
  if (style.letterSpacing.value !== 0 && style.letterSpacing.unit !== 'PIXELS') {
    throw new Error(`text style "${style.name}" non-zero letterSpacing unit ${style.letterSpacing.unit} not supported — only PIXELS`);
  }
  const fontSize = style.fontSize;
  const lineHeight = round(style.lineHeight.value, 4);
  const letterSpacing = style.letterSpacing.value === 0 ? 0 : round(style.letterSpacing.value, 4);

  const composite = {
    fontFamily: aliasOrThrow(typoMap.fontFamily(family), 'fontFamily', family, style.name),
    fontSize: aliasOrInline(typoMap.fontSize(fontSize), fontSize, 'fontSize', style.name),
    fontWeight: aliasOrThrow(typoMap.fontWeight(weight), 'fontWeight', weight, style.name),
    lineHeight: aliasOrInline(typoMap.lineHeight(lineHeight), lineHeight, 'lineHeight', style.name),
    letterSpacing: aliasOrThrow(typoMap.letterSpacing(letterSpacing), 'letterSpacing', letterSpacing, style.name),
  };

  const ext = {};
  if (style.textCase && style.textCase !== 'ORIGINAL') ext['com.acronis.textCase'] = style.textCase;
  if (style.textDecoration && style.textDecoration !== 'NONE') ext['com.acronis.textDecoration'] = style.textDecoration;
  ext['com.figma.styleId'] = style.id;

  setPath(out.typography, ourPath, { $value: composite, platforms: ['PD'], $extensions: ext });
  typoCount++;
}

if (rawValueWarnings.length) {
  console.warn('Typography primitive gaps (raw dimensions inlined):');
  for (const w of rawValueWarnings) console.warn('  -', w);
}

// ---------- sort + reorder ----------
const sorted = sortNode(out);
sorted.colors = reorderByList(sorted.colors, ['$type', 'background', 'border', 'glyph', 'text']);
if (sorted.colors.background) sorted.colors.background = reorderByList(sorted.colors.background, ['surface', 'brand', 'overlay', 'status', 'status-strong', 'inverted']);
if (sorted.colors.border) sorted.colors.border = reorderByList(sorted.colors.border, ['on-surface', 'on-brand', 'on-status']);
for (const role of ['glyph', 'text']) {
  if (sorted.colors[role]) sorted.colors[role] = reorderByList(sorted.colors[role], ['on-surface', 'on-brand', 'on-overlay', 'on-status', 'on-inverted']);
}
sorted.typography = reorderByList(sorted.typography, ['$type', 'headings', 'body', 'link', 'caption', 'note', 'fineprint']);
if (sorted.typography.headings) sorted.typography.headings = reorderByList(sorted.typography.headings, ['display', 'title', 'lead']);
if (sorted.typography.body)     sorted.typography.body     = reorderByList(sorted.typography.body,     ['default', 'strong', 'strong-underlined', 'heading', 'accent']);
if (sorted.typography.link)     sorted.typography.link     = reorderByList(sorted.typography.link,     ['primary', 'secondary']);
if (sorted.typography.caption)  sorted.typography.caption  = reorderByList(sorted.typography.caption,  ['default', 'strong', 'accent']);
if (sorted.typography.note)     sorted.typography.note     = reorderByList(sorted.typography.note,     ['default', 'heading']);
const root = reorderByList(sorted, ['$schema', 'colors', 'gradients', 'typography']);

fs.writeFileSync(OUT, formatDtcgJson(root) + '\n');

console.log(`Wrote ${OUT}: ${count + gradientCount + typoCount} leaves (${count} variable-backed colors + ${gradientCount} gradients + ${typoCount} typography)`);

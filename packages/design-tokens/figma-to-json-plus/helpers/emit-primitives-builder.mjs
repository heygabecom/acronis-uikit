// figma-to-json-plus/helpers/emit-primitives-builder.mjs
// Builds tiers/primitives.json from a normalized figma-snapshot.json.
// Handles palette (theme collection), units (gap/size/radius/stroke),
// and font (font-family/weight/size/line-height/letter-spacing from styles).

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ColorUtils } from './utils-color.mjs';
import { TreeUtils } from './utils-tree.mjs';
import { DtcgWalker } from './utils-dtcg-walker.mjs';
import { DtcgFormatter } from './utils-dtcg-formatter.mjs';
import { PaletteMapper } from './emit-palette-mapper.mjs';
import { TypographyMapper } from './emit-typography-mapper.mjs';

const OUT_PATH = fileURLToPath(new URL('../../../tiers/primitives.json', import.meta.url));

// Orphan palette stops that Figma never exports as local Mode variables.
// These are referenced by semantic tokens; keep them in sync manually.
const ORPHAN_PALETTE = [
  { ourPath: ['transparent', 'inverted', '6'], variableId: 'VariableID:139:23',
    light: { colorSpace: 'hsl', components: [0, 0, 100], alpha: 0.4 },
    dark:  { colorSpace: 'hsl', components: [0, 0,   0], alpha: 0.4 } },
  { ourPath: ['transparent', 'inverted', '8'], variableId: 'VariableID:139:25',
    light: { colorSpace: 'hsl', components: [0, 0, 100], alpha: 0.2 },
    dark:  { colorSpace: 'hsl', components: [0, 0,   0], alpha: 0.2 } },
];

export class PrimitivesEmitter {
  #snapshot;

  constructor(snapshot) {
    this.#snapshot = snapshot;
  }

  emit() {
    const out = {
      $schema: '../schemas/tokens.schema.json',
      palette: { $type: 'color' },
      font: {
        'font-family':    { $type: 'fontFamily' },
        'font-weight':    { $type: 'fontWeight' },
        'font-size':      { $type: 'dimension' },
        'line-height':    { $type: 'dimension' },
        'letter-spacing': {
          $type: 'dimension',
          $description: 'Derived from Figma Text Styles; no source Variable.',
        },
      },
      units: { $type: 'dimension' },
    };

    this.#emitPalette(out);
    this.#emitOrphanPalette(out);
    this.#emitUnits(out);
    this.#emitFont(out);
    this.#emitLetterSpacing(out);

    const sorted = TreeUtils.sortNode(out);
    const PALETTE_ORDER = ['$type', 'base', 'grayscale', 'blue', 'teal', 'green', 'yellow', 'orange', 'red', 'violet', 'ink', 'transparent'];
    sorted.palette = TreeUtils.reorderByList(sorted.palette, PALETTE_ORDER);
    sorted.units = TreeUtils.reorderByList(sorted.units, ['$type', 'gap', 'size', 'radius', 'stroke']);
    sorted.font['font-weight'] = TreeUtils.reorderByList(sorted.font['font-weight'], ['$type', 'regular', 'medium', 'semibold', 'bold']);
    const root = TreeUtils.reorderByList(sorted, ['$schema', 'palette', 'units', 'font']);

    fs.writeFileSync(OUT_PATH, DtcgFormatter.serialize(root));
    return root;
  }

  get outputPath() { return OUT_PATH; }

  #emitPalette(out) {
    const themeNode = this.#snapshot.variables?.theme;
    if (!themeNode) throw new Error('Snapshot missing "theme" collection — expected palette source.');

    for (const { path, leaf } of DtcgWalker.walk(themeNode)) {
      const ourPath = PaletteMapper.map(path);
      const lightHex = leaf.$value;
      const darkHex  = leaf.$extensions?.modes?.Dark ?? leaf.$value;
      const variableId = leaf.$extensions?.['com.figma.variableId'];
      const ext = this.#buildFigmaExt(leaf.$extensions, variableId);

      TreeUtils.setPath(out, ['palette', ...ourPath], {
        values: {
          light: ColorUtils.hexToHslValue(lightHex),
          dark:  ColorUtils.hexToHslValue(darkHex),
        },
        platforms: ['PD'],
        $extensions: ext,
      });
    }
  }

  #emitOrphanPalette(out) {
    for (const o of ORPHAN_PALETTE) {
      const ext = { 'com.figma.scopes': [], 'com.figma.variableId': o.variableId, 'com.figma.hiddenFromPublishing': true };
      TreeUtils.setPath(out, ['palette', ...o.ourPath], {
        values: { light: o.light, dark: o.dark },
        platforms: ['PD'],
        $extensions: ext,
      });
    }
  }

  #emitUnits(out) {
    const unitsNode = this.#snapshot.variables?.units;
    if (!unitsNode) throw new Error('Snapshot missing "units" collection.');

    const UNIT_SECTIONS = [
      { key: 'gap',    prefix: 'gap',    outKey: 'gap' },
      { key: 'size',   prefix: 'size',   outKey: 'size' },
      { key: 'radius', prefix: 'radius', outKey: 'radius' },
      { key: 'stroke', prefix: 'width',  outKey: 'stroke' },
    ];

    for (const { key, prefix, outKey } of UNIT_SECTIONS) {
      const section = unitsNode[key];
      if (!section) continue;
      for (const { path, leaf } of DtcgWalker.walk(section)) {
        const localKey = path[path.length - 1].replace(new RegExp(`^${prefix}-`), '');
        const value = typeof leaf.$value === 'number' ? leaf.$value : Number(leaf.$value);
        const variableId = leaf.$extensions?.['com.figma.variableId'];
        const ext = {
          'com.acronis.units': { value: ColorUtils.round(value, 4), unit: 'px' },
          ...this.#buildFigmaExt(leaf.$extensions, variableId),
        };
        TreeUtils.setPath(out, ['units', outKey, localKey], { platforms: ['PD'], $extensions: ext });
      }
    }
  }

  #emitFont(out) {
    const fontNode = this.#snapshot.variables?.font;
    if (!fontNode) throw new Error('Snapshot missing "font" collection.');

    const FONT_SECTIONS = [
      { key: 'font-family',  prefix: null,          type: 'fontFamily' },
      { key: 'font-weight',  prefix: 'font-weight', type: 'fontWeight' },
      { key: 'font-size',    prefix: 'font-size',   type: 'dimension' },
      { key: 'line-height',  prefix: 'line-height', type: 'dimension' },
    ];

    for (const { key, prefix, type } of FONT_SECTIONS) {
      const section = fontNode[key];
      if (!section) continue;
      for (const { path, leaf } of DtcgWalker.walk(section)) {
        const localKey = prefix
          ? path[path.length - 1].replace(new RegExp(`^${prefix}-`), '')
          : path[path.length - 1];
        const value = leaf.$value;
        const variableId = leaf.$extensions?.['com.figma.variableId'];
        const unitsValue = type === 'dimension'
          ? { value: ColorUtils.round(Number(value), 4), unit: 'px' }
          : value;
        const ext = {
          'com.acronis.units': unitsValue,
          ...this.#buildFigmaExt(leaf.$extensions, variableId),
        };
        TreeUtils.setPath(out, ['font', key, localKey], { platforms: ['PD'], $extensions: ext });
      }
    }
  }

  #emitLetterSpacing(out) {
    const textStyles = this.#snapshot.styles?.text ?? [];
    const lsValues = new Set();
    for (const s of textStyles) {
      const ls = s.letterSpacing;
      if (!ls) continue;
      if (ls.value === 0) { lsValues.add(0); continue; }
      if (ls.unit !== 'PIXELS') throw new Error(`Text style "${s.name}" non-zero letterSpacing unit ${ls.unit} — only PIXELS supported.`);
      lsValues.add(ColorUtils.round(ls.value, 4));
    }
    for (const px of [...lsValues].sort((a, b) => a - b)) {
      TreeUtils.setPath(out, ['font', 'letter-spacing', TypographyMapper.lsSlug(px)], {
        platforms: ['PD'],
        $extensions: { 'com.acronis.units': { unit: 'px', value: px } },
      });
    }
  }

  #buildFigmaExt(ext, variableId) {
    const out = {};
    if (variableId) out['com.figma.variableId'] = variableId;
    if (ext?.['com.figma.scopes']) out['com.figma.scopes'] = ext['com.figma.scopes'];
    if (ext?.['com.figma.hiddenFromPublishing']) out['com.figma.hiddenFromPublishing'] = true;
    return out;
  }
}

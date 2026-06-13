// figma-to-json-plus/helpers/emit-typography-mapper.mjs
// Builds value→alias lookups from tiers/primitives.json for all typography
// primitive dimensions (fontFamily, fontSize, fontWeight, lineHeight,
// letterSpacing).

import { DtcgWalker } from './utils-dtcg-walker.mjs';

// Maps font style strings to numeric weights.
const WEIGHT_MAP = new Map([
  ['Thin', 100], ['Extra Light', 200], ['Light', 300],
  ['Regular', 400], ['Medium', 500], ['Semi Bold', 600],
  ['Bold', 700], ['Extra Bold', 800], ['Black', 900],
]);

export class TypographyMapper {
  #map = { fontFamily: new Map(), fontSize: new Map(), fontWeight: new Map(), lineHeight: new Map(), letterSpacing: new Map() };

  constructor(primitives) {
    this.#buildFromPrimitives(primitives);
  }

  fontFamily(family)        { return this.#map.fontFamily.get(family) ?? null; }
  fontSize(px)              { return this.#map.fontSize.get(px) ?? null; }
  fontWeight(numericWeight) { return this.#map.fontWeight.get(numericWeight) ?? null; }
  lineHeight(px)            { return this.#map.lineHeight.get(px) ?? null; }
  letterSpacing(px)         { return this.#map.letterSpacing.get(px) ?? null; }

  static styleToWeight(style) {
    return WEIGHT_MAP.get(style?.trim()) ?? null;
  }

  // Derive the letter-spacing token slug from a px value (matches figma-to-primitives logic).
  static lsSlug(px) {
    if (px === 0) return '0';
    return String(px).replace('.', '-');
  }

  // Map a Figma text style name (e.g. "body/body-strong") to a DTCG path array.
  static mapTextStyleName(name) {
    const parts = name.split('/').map(p =>
      p.toLowerCase().replace(/\s+/g, '-').replace(/^body-/, ''),
    );
    return parts;
  }

  #buildFromPrimitives(primitives) {
    const font = primitives.font;
    if (!font) return;

    for (const { path, leaf } of DtcgWalker.walk(font)) {
      const units = leaf.$extensions?.['com.acronis.units'];
      const section = path[0]; // font-family, font-weight, font-size, …

      switch (section) {
        case 'font-family':
          if (typeof units === 'string') {
            const alias = `{font.${path.join('.')}}`;
            this.#map.fontFamily.set(units, alias);
          }
          break;
        case 'font-weight':
          if (units !== undefined) {
            const alias = `{font.${path.join('.')}}`;
            this.#map.fontWeight.set(Number(units), alias);
          }
          break;
        case 'font-size':
          if (units?.value !== undefined) {
            const alias = `{font.${path.join('.')}}`;
            this.#map.fontSize.set(units.value, alias);
          }
          break;
        case 'line-height':
          if (units?.value !== undefined) {
            const alias = `{font.${path.join('.')}}`;
            this.#map.lineHeight.set(units.value, alias);
          }
          break;
        case 'letter-spacing':
          if (units?.value !== undefined) {
            const alias = `{font.${path.join('.')}}`;
            this.#map.letterSpacing.set(units.value, alias);
          }
          break;
      }
    }
  }
}

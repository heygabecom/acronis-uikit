// figma-to-json-plus/helpers/utils-dtcg-formatter.mjs
// Mixed-layout JSON formatter: multi-line for top-level groups and known
// block keys ($extensions, values, $type, $value, platforms), inline for
// short leaf objects (under 250 chars).

export class DtcgFormatter {
  static BLOCK_KEYS = new Set(['$extensions', 'values', '$type', '$value', 'platforms']);
  static INLINE_LIMIT = 250;

  // Returns a formatted JSON string for a DTCG token tree.
  static format(value, indent = 0) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return JSON.stringify(value);
    }

    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';

    // Try inline if it's a leaf-level or small object.
    const inlined = DtcgFormatter._tryInline(value);
    if (inlined !== null && indent > 0) return inlined;

    const pad = '  '.repeat(indent);
    const childPad = '  '.repeat(indent + 1);
    const lines = keys.map(k => {
      const v = value[k];
      let formatted;
      if (DtcgFormatter.BLOCK_KEYS.has(k) && v && typeof v === 'object' && !Array.isArray(v)) {
        formatted = DtcgFormatter.format(v, indent + 1);
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        formatted = DtcgFormatter.format(v, indent + 1);
      } else {
        formatted = JSON.stringify(v);
      }
      return `${childPad}${JSON.stringify(k)}: ${formatted}`;
    });
    return `{\n${lines.join(',\n')}\n${pad}}`;
  }

  static _tryInline(value) {
    const s = JSON.stringify(value);
    if (s.length <= DtcgFormatter.INLINE_LIMIT) return s;
    return null;
  }

  // Top-level entry: format and append newline.
  static serialize(root) {
    return DtcgFormatter.format(root) + '\n';
  }
}

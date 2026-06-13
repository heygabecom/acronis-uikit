// figma-to-json-plus/helpers/utils-tree.mjs
// Generic DTCG tree operations: path manipulation, leaf collection, sorting.

export class TreeUtils {
  // Set a nested value at path[], creating intermediate objects as needed.
  static setPath(obj, path, value) {
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in cur) || typeof cur[path[i]] !== 'object') {
        cur[path[i]] = {};
      }
      cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = value;
  }

  // Yield {path: string[], leaf} for every node with a $value key.
  static *collectColorLeaves(node, path = []) {
    if (!node || typeof node !== 'object') return;
    if ('$value' in node && (node.$type === 'color' || !node.$type)) {
      yield { path, leaf: node };
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      yield* TreeUtils.collectColorLeaves(v, [...path, k]);
    }
  }

  // Deep-sort an object's keys: $-prefixed metadata first, then others
  // alphabetically with all-numeric keys sorted numerically.
  static sortNode(node) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return node;
    const meta = Object.keys(node).filter(k => k.startsWith('$')).sort();
    const rest = Object.keys(node).filter(k => !k.startsWith('$'));
    const allNumeric = rest.every(k => /^\d+$/.test(k));
    const sorted = allNumeric
      ? rest.slice().sort((a, b) => Number(a) - Number(b))
      : rest.slice().sort();
    const out = {};
    for (const k of [...meta, ...sorted]) {
      out[k] = TreeUtils.sortNode(node[k]);
    }
    return out;
  }

  // Reorder the top-level keys of obj according to the order list.
  // Keys not in the list are appended alphabetically at the end.
  static reorderByList(obj, order) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = {};
    for (const k of order) {
      if (k in obj) out[k] = obj[k];
    }
    for (const k of Object.keys(obj).sort()) {
      if (!(k in out)) out[k] = obj[k];
    }
    return out;
  }
}

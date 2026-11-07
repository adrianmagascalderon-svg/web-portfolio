// Layout: turns rows of items into a gap-free tiling of rectangular pieces on a cell grid.
// Row heights come from measured content, so text never overflows its piece.

// Split `cols` cells among items by weight (every item gets at least minW cells).
export function distribute(cols, weights, minW = 2) {
  const total = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (cols * w) / total);
  const out = raw.map(r => Math.max(minW, Math.floor(r)));
  let sum = out.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, f: r - Math.floor(r) }))
    .sort((a, b) => b.f - a.f);
  let k = 0;
  while (sum < cols) { out[order[k % order.length].i]++; sum++; k++; }
  while (sum > cols) {
    const i = out.indexOf(Math.max(...out));
    if (out[i] <= minW) break;
    out[i]--; sum--;
  }
  return out;
}

// rows: [{ items: [{ id, weight, minRows, html, cls, ... }], minRows }]
export function buildLayout(rows, { cols, cs, pad, measure, minRows = 2 }) {
  const pieces = [];
  let y = 0;
  for (const row of rows) {
    if (!row.items.length) continue; // never render an empty row
    const widths = distribute(cols, row.items.map(i => i.weight || 1));
    let need = Math.max(row.minRows || minRows, ...row.items.map(i => i.minRows || 0));
    row.items.forEach((item, k) => {
      const h = item.fixed ? 0 : measure(item, widths[k] * cs - 2 * pad);   // fixed = height set by the row, never by content
      need = Math.max(need, Math.ceil((h + 2 * pad) / cs));
    });
    let x = 0;
    row.items.forEach((item, k) => {
      pieces.push({ id: item.id, item, x, y, w: widths[k], h: need });
      x += widths[k];
    });
    y += need;
  }
  const owner = new Map();
  for (const p of pieces) {
    for (let dx = 0; dx < p.w; dx++)
      for (let dy = 0; dy < p.h; dy++) owner.set(`${p.x + dx},${p.y + dy}`, p.id);
  }
  return { pieces, rows: y, ownerAt: (cx, cy) => owner.get(`${cx},${cy}`) };
}

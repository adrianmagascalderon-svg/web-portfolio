// PuzzleGeometry: real jigsaw paths on a cell grid (cells may be taller than wide).
// Every boundary between two pieces is built from the SAME canonical curve,
// so the tab of one piece and the socket of its neighbour match exactly.

export const MARGIN = 0.26; // how far a tab may reach outside a piece box, relative to knob size
const T = 0.09;             // tab size

// Canonical knob (unit coordinates: u along the edge, v toward the bulge).
// Three cubic segments from (0,0) to (1,0).
const KNOB = [
  [[0.2, 0], [0.5, -T], [0.5 - T, T]],
  [[0.5 - 2 * T, 3 * T], [0.5 + 2 * T, 3 * T], [0.5 + T, T]],
  [[0.5, -T], [0.8, 0], [1, 0]],
];

function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13;
  return h >>> 0;
}

// +1 / -1: which side of a shared edge the knob bulges to.
function edgeSign(seed, key) {
  return hash(seed + '|' + key) & 1 ? 1 : -1;
}

// The knob keeps the same size and shape on every edge: k = min(cell width, cell height).
// It is centred on the edge; straight segments fill the rest.
function knob(A, B, n, k) {
  const len = Math.hypot(B.x - A.x, B.y - A.y);
  const ex = (B.x - A.x) / len;
  const ey = (B.y - A.y) / len;
  const P = (u, v) => {
    const along = len / 2 + (u - 0.5) * k;
    return { x: A.x + ex * along + n.x * v * k, y: A.y + ey * along + n.y * v * k };
  };
  const segs = KNOB.map(([c1, c2, p]) => [P(...c1), P(...c2), P(...p)]);
  return { start: P(0, 0), end: P(1, 0), segs };
}

/**
 * piece: {x, y, w, h} in cells.  ownerAt(cx, cy) -> id of the piece covering that cell (or undefined).
 * cw / ch: cell width / height in px.
 * Returns the SVG path (relative to the piece box) and the box in stage pixels.
 */
export function buildPiecePath(piece, ownerAt, cw, ch, seed) {
  const k = Math.min(cw, ch);
  const m = Math.round(MARGIN * k);
  const ox = piece.x * cw - m;
  const oy = piece.y * ch - m;
  const f = v => +v.toFixed(2);
  const pt = p => `${f(p.x - ox)} ${f(p.y - oy)}`;

  const X0 = piece.x * cw, Y0 = piece.y * ch;
  const X1 = (piece.x + piece.w) * cw, Y1 = (piece.y + piece.h) * ch;
  let d = `M${pt({ x: X0, y: Y0 })}`;

  function segment(S, E, neighbor, key, dir) {
    if (!neighbor) { d += `L${pt(E)}`; return; }
    const s = edgeSign(seed, key);
    const n = dir === 'h' ? { x: 0, y: s } : { x: s, y: 0 };
    const reversed = dir === 'h' ? E.x < S.x : E.y < S.y;
    const A = reversed ? E : S;
    const B = reversed ? S : E;
    const { start, end, segs } = knob(A, B, n, k);
    if (!reversed) {
      d += `L${pt(start)}`;
      for (const [c1, c2, p] of segs) d += `C${pt(c1)} ${pt(c2)} ${pt(p)}`;
      d += `L${pt(E)}`;
    } else {
      const nodes = [start, ...segs.map(sg => sg[2])];
      d += `L${pt(end)}`;
      for (let i = segs.length - 1; i >= 0; i--) d += `C${pt(segs[i][1])} ${pt(segs[i][0])} ${pt(nodes[i])}`;
      d += `L${pt(E)}`;
    }
  }

  // top edge, left -> right
  for (let i = 0; i < piece.w; i++) {
    const cx = piece.x + i;
    segment({ x: X0 + i * cw, y: Y0 }, { x: X0 + (i + 1) * cw, y: Y0 },
      ownerAt(cx, piece.y - 1), `h:${cx},${piece.y}`, 'h');
  }
  // right edge, top -> bottom
  for (let j = 0; j < piece.h; j++) {
    const cy = piece.y + j;
    segment({ x: X1, y: Y0 + j * ch }, { x: X1, y: Y0 + (j + 1) * ch },
      ownerAt(piece.x + piece.w, cy), `v:${piece.x + piece.w},${cy}`, 'v');
  }
  // bottom edge, right -> left
  for (let i = piece.w - 1; i >= 0; i--) {
    const cx = piece.x + i;
    segment({ x: X0 + (i + 1) * cw, y: Y1 }, { x: X0 + i * cw, y: Y1 },
      ownerAt(cx, piece.y + piece.h), `h:${cx},${piece.y + piece.h}`, 'h');
  }
  // left edge, bottom -> top
  for (let j = piece.h - 1; j >= 0; j--) {
    const cy = piece.y + j;
    segment({ x: X0, y: Y0 + (j + 1) * ch }, { x: X0, y: Y0 + j * ch },
      ownerAt(piece.x - 1, cy), `v:${piece.x},${cy}`, 'v');
  }
  d += 'Z';

  return {
    d,
    m,
    box: { left: ox, top: oy, width: piece.w * cw + 2 * m, height: piece.h * ch + 2 * m },
  };
}

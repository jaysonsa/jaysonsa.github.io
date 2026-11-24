// Navigation grid + A* pathfinding so teammates walk around walls, furniture,
// teepees, fences, and the chick ranges instead of through them.
import {
  FARM,
  FARM_PALMS,
  FURNITURE,
  RANGE_SIZE,
  RANGES,
  teepeePositions,
  treePositions,
  WALLS,
  WORLD_BOUNDS,
} from './world.js';

const CELL = 0.5;
const BODY = 0.3; // obstacles are inflated by this radius
const { x0: X0, x1: X1, z0: Z0, z1: Z1 } = WORLD_BOUNDS;
const COLS = Math.ceil((X1 - X0) / CELL);
const ROWS = Math.ceil((Z1 - Z0) / CELL);

let grid; // Uint8Array, 1 = blocked

const toCol = (x) => Math.floor((x - X0) / CELL);
const toRow = (z) => Math.floor((z - Z0) / CELL);
const cellX = (c) => X0 + (c + 0.5) * CELL;
const cellZ = (r) => Z0 + (r + 0.5) * CELL;
const inside = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS;

function blockRect(xa, za, xb, zb) {
  const c0 = Math.max(0, toCol(Math.min(xa, xb) - BODY));
  const c1 = Math.min(COLS - 1, toCol(Math.max(xa, xb) + BODY));
  const r0 = Math.max(0, toRow(Math.min(za, zb) - BODY));
  const r1 = Math.min(ROWS - 1, toRow(Math.max(za, zb) + BODY));
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) grid[r * COLS + c] = 1;
}

const blockBox = (cx, cz, hx, hz) => blockRect(cx - hx, cz - hz, cx + hx, cz + hz);

function build() {
  grid = new Uint8Array(COLS * ROWS);
  WALLS.forEach(([xa, za, xb, zb]) => blockRect(xa, za, xb, zb));
  FURNITURE.forEach(([cx, cz, hx, hz]) => blockBox(cx, cz, hx, hz));

  // Farm: teepees, perimeter fence with a gate gap, palms.
  teepeePositions().forEach(({ x, z }) => blockBox(x, z, 0.25, 0.35));
  const { X_GATE, X_FAR, Z_MIN, Z_MAX, AISLE_Z } = FARM;
  blockRect(X_FAR, Z_MIN, X_GATE, Z_MIN);
  blockRect(X_FAR, Z_MAX, X_GATE, Z_MAX);
  blockRect(X_FAR, Z_MIN, X_FAR, Z_MAX);
  blockRect(X_GATE, Z_MIN, X_GATE, AISLE_Z - 1.6);
  blockRect(X_GATE, AISLE_Z + 1.6, X_GATE, Z_MAX);
  FARM_PALMS.forEach(({ position: [x, , z] }) => blockBox(x, z, 0.2, 0.2));

  RANGES.forEach(({ position: [x, , z] }) => blockBox(x, z, RANGE_SIZE.W / 2, RANGE_SIZE.D / 2));
  treePositions().forEach(([x, z, s]) => blockBox(x, z, 0.25 * s, 0.25 * s));
}

function ensure() {
  if (!grid) build();
}

export function isWalkable(x, z) {
  ensure();
  const c = toCol(x);
  const r = toRow(z);
  return inside(c, r) && grid[r * COLS + c] === 0;
}

// Breadth-first search outward for the closest open cell.
function nearestFree(c, r) {
  if (inside(c, r) && !grid[r * COLS + c]) return [c, r];
  for (let rad = 1; rad < 40; rad++) {
    let best = null;
    let bestD = Infinity;
    for (let dr = -rad; dr <= rad; dr++) {
      for (let dc = -rad; dc <= rad; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
        const cc = c + dc;
        const rr = r + dr;
        if (!inside(cc, rr) || grid[rr * COLS + cc]) continue;
        const d = dc * dc + dr * dr;
        if (d < bestD) {
          bestD = d;
          best = [cc, rr];
        }
      }
    }
    if (best) return best;
  }
  return null;
}

// Minimal binary heap keyed by f-score.
class Heap {
  constructor() {
    this.items = [];
  }
  push(node, f) {
    const a = this.items;
    a.push([f, node]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top[1];
  }
  get size() {
    return this.items.length;
  }
}

const DIRS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

function astar(start, goal) {
  const n = COLS * ROWS;
  const g = new Float32Array(n).fill(Infinity);
  const came = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const s = start[1] * COLS + start[0];
  const t = goal[1] * COLS + goal[0];
  const h = (i) => {
    const dc = Math.abs((i % COLS) - goal[0]);
    const dr = Math.abs(Math.floor(i / COLS) - goal[1]);
    return dc + dr + (Math.SQRT2 - 2) * Math.min(dc, dr); // octile distance
  };
  const open = new Heap();
  g[s] = 0;
  open.push(s, h(s));
  while (open.size) {
    const cur = open.pop();
    if (cur === t) break;
    if (closed[cur]) continue;
    closed[cur] = 1;
    const c = cur % COLS;
    const r = Math.floor(cur / COLS);
    for (const [dc, dr, cost] of DIRS) {
      const cc = c + dc;
      const rr = r + dr;
      if (!inside(cc, rr)) continue;
      const ni = rr * COLS + cc;
      if (grid[ni] || closed[ni]) continue;
      // No cutting corners past obstacles.
      if (dc && dr && (grid[r * COLS + cc] || grid[rr * COLS + c])) continue;
      const ng = g[cur] + cost;
      if (ng < g[ni]) {
        g[ni] = ng;
        came[ni] = cur;
        open.push(ni, ng + h(ni));
      }
    }
  }
  if (came[t] === -1 && s !== t) return null;
  const cells = [];
  for (let i = t; i !== -1; i = came[i]) cells.unshift(i);
  return cells.map((i) => [cellX(i % COLS), cellZ(Math.floor(i / COLS))]);
}

// Straight line clear of obstacles? (sampled every quarter cell)
function clearLine([ax, az], [bx, bz]) {
  const len = Math.hypot(bx - ax, bz - az);
  const steps = Math.ceil(len / (CELL / 4));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (!isWalkable(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
  }
  return true;
}

// Remove unnecessary waypoints ("string pulling").
function smooth(points) {
  if (points.length < 3) return points;
  const out = [points[0]];
  let anchor = 0;
  for (let i = 2; i < points.length; i++) {
    if (!clearLine(points[anchor], points[i])) {
      out.push(points[i - 1]);
      anchor = i - 1;
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * Plan a walkable route between two world points.
 * Start/goal may sit inside an obstacle (e.g. a seat at a desk); the route then
 * leaves/enters through the nearest open cell.
 * @returns {Array<[number, number]>} waypoints in world x/z, excluding the start.
 */
export function findPath(from, to, { exact = false } = {}) {
  ensure();
  const sc = nearestFree(toCol(from[0]), toRow(from[1]));
  const gc = nearestFree(toCol(to[0]), toRow(to[1]));
  if (!sc || !gc) return [to];
  const cells = astar(sc, gc);
  if (!cells) return [to];
  // Clicked on furniture? Stop beside it instead of walking into it.
  const goal = exact ? to : [cellX(gc[0]), cellZ(gc[1])];
  const pts = smooth([from, ...cells, goal]);
  return pts.slice(1);
}

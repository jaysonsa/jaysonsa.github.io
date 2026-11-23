import * as THREE from 'three';
import { getState, setState } from './store.js';

// The virtual teammates. Home positions are in world coordinates (their desk or post).
export const TEAM = [
  {
    id: 'kulet',
    name: 'Kulet',
    station: 'asset-hub',
    accent: '#5b8def',
    home: [-6.6, 0, -5.88],
    rotation: Math.PI,
    pose: 'sit',
    look: { skin: '#c68642', hair: 'spiky', hairColor: '#111111', shirt: '#5b8def', pants: '#334155', shoes: '#f97316' },
  },
  {
    id: 'olly',
    name: 'Olly',
    station: 'anomaly-alerts',
    accent: '#ef5b4c',
    home: [0, 0, -6.38],
    rotation: Math.PI,
    pose: 'sit',
    look: { skin: '#e0ac69', hair: 'short', hairColor: '#4a2c17', shirt: '#ef5b4c', pants: '#1e293b', accessory: 'headphones' },
  },
  {
    id: 'lexi',
    name: 'Lexi',
    station: 'promo-radar',
    accent: '#f6c445',
    home: [8.5, 0, -4.4],
    rotation: -2.2,
    pose: 'point',
    look: { skin: '#f1c27d', hair: 'long', hairColor: '#2b1a10', shirt: '#f6c445', pants: '#1f2937', shoes: '#111827' },
  },
  {
    id: 'baet',
    name: 'Baet',
    station: 'customer-insights',
    accent: '#4cb071',
    home: [5.5, 0, 5.0],
    rotation: 1.1,
    pose: 'gesture',
    look: { skin: '#8d5524', hair: 'curly', hairColor: '#1a1a1a', shirt: '#4cb071', pants: '#3f3f46', accessory: 'glasses' },
  },
  {
    id: 'beeone',
    name: 'BeeOne',
    station: 'farm-ledger',
    accent: '#9b6bdf',
    home: [-8.63, 0, 5.2],
    rotation: -Math.PI / 2,
    pose: 'sit',
    look: { skin: '#d9a066', hair: 'short', hairColor: '#3b2416', shirt: '#9b6bdf', pants: '#44403c', shoes: '#a16207', accessory: 'hat' },
  },
];

export const TEAM_BY_ID = Object.fromEntries(TEAM.map((m) => [m.id, m]));
export const TEAM_BY_STATION = Object.fromEntries(TEAM.map((m) => [m.station, m]));

// ---- Live movement state (mutated every frame, not React state) ----
export const runtime = Object.fromEntries(
  TEAM.map((m) => [m.id, { pos: new THREE.Vector3(...m.home), path: [], heading: m.rotation }]),
);

export function setControlled(id) {
  setState({ controlled: id });
}

// Only the back wall and the left (glass) wall are solid; the front and right sides are open.
const WALLS = [
  [
    [-12.25, -9.1],
    [12.25, -9.1],
  ],
  [
    [-12.1, -9.25],
    [-12.1, 9.25],
  ],
];
const CORNERS = [
  [-11.6, 9.75], // just inside the open front edge, beside the glass wall
  [-12.9, 9.9],
  [12.9, 9.9],
  [12.9, -9.9],
  [-12.9, -9.9],
];
const BOUNDS = { x0: -45, x1: 35, z0: -35, z1: 30 };

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function segmentsCross(p1, p2, q1, q2) {
  const d1 = cross(q1, q2, p1);
  const d2 = cross(q1, q2, p2);
  const d3 = cross(p1, p2, q1);
  const d4 = cross(p1, p2, q2);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function blocked(a, b) {
  return WALLS.some(([w1, w2]) => segmentsCross(a, b, w1, w2));
}

// Shortest route around the walls using the building corners as waypoints.
function plan(from, to) {
  const nodes = [from, ...CORNERS, to];
  const n = nodes.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const done = Array(n).fill(false);
  dist[0] = 0;
  for (let k = 0; k < n; k++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    done[u] = true;
    for (let v = 0; v < n; v++) {
      if (done[v] || blocked(nodes[u], nodes[v])) continue;
      const d = dist[u] + Math.hypot(nodes[u][0] - nodes[v][0], nodes[u][1] - nodes[v][1]);
      if (d < dist[v]) {
        dist[v] = d;
        prev[v] = u;
      }
    }
  }
  if (dist[n - 1] === Infinity) return [to];
  const path = [];
  for (let v = n - 1; v > 0; v = prev[v]) path.unshift(nodes[v]);
  return path;
}

export function walkTo(id, point) {
  const r = runtime[id];
  if (!r) return;
  const to = [
    THREE.MathUtils.clamp(point.x, BOUNDS.x0, BOUNDS.x1),
    THREE.MathUtils.clamp(point.z, BOUNDS.z0, BOUNDS.z1),
  ];
  r.path = plan([r.pos.x, r.pos.z], to).map(([x, z]) => new THREE.Vector3(x, 0, z));
  r.goingHome = false;
  setState({ marker: { x: to[0], z: to[1], t: Date.now() } });
}

export function commandWalk(point) {
  const id = getState().controlled;
  if (id) walkTo(id, point);
}

export function sendHome(id) {
  const m = TEAM_BY_ID[id];
  if (!m) return;
  walkTo(id, new THREE.Vector3(...m.home));
  runtime[id].goingHome = true;
}

export function isHome(id) {
  const m = TEAM_BY_ID[id];
  const r = runtime[id];
  return r.path.length === 0 && Math.hypot(r.pos.x - m.home[0], r.pos.z - m.home[2]) < 0.05;
}

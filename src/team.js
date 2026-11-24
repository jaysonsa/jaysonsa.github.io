import * as THREE from 'three';
import { getState, setState } from './store.js';
import { findPath } from './nav.js';
import { WORLD_BOUNDS } from './world.js';

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

const BOUNDS = WORLD_BOUNDS;

export function walkTo(id, point, { exact = false } = {}) {
  const r = runtime[id];
  if (!r) return;
  const to = [
    THREE.MathUtils.clamp(point.x, BOUNDS.x0, BOUNDS.x1),
    THREE.MathUtils.clamp(point.z, BOUNDS.z0, BOUNDS.z1),
  ];
  r.path = findPath([r.pos.x, r.pos.z], to, { exact }).map(([x, z]) => new THREE.Vector3(x, 0, z));
  r.goingHome = false;
  const end = r.path[r.path.length - 1];
  if (!exact && end) setState({ marker: { x: end.x, z: end.z, t: Date.now() } });
}

export function commandWalk(point) {
  const id = getState().controlled;
  if (id) walkTo(id, point);
}

export function sendHome(id) {
  const m = TEAM_BY_ID[id];
  if (!m) return;
  walkTo(id, new THREE.Vector3(...m.home), { exact: true });
  runtime[id].goingHome = true;
}

export function isHome(id) {
  const m = TEAM_BY_ID[id];
  const r = runtime[id];
  return r.path.length === 0 && Math.hypot(r.pos.x - m.home[0], r.pos.z - m.home[2]) < 0.05;
}

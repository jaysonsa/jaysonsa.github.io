// Single source of truth for where things are in the world.
// Both the 3D scene and the navigation grid (src/nav.js) read from here.

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---- JER Gamefarm field ----
export const FARM = {
  X_NEAR: -18, // column closest to the office
  X_STEP: 1.6, // spacing along a row
  COLS: 28,
  Z0: -24,
  Z_STEP: 4.5, // wide lawn between rows
  ROWS: 11,
  AISLE_Z: 9.75, // main dirt aisle from the gate
};
FARM.X_GATE = FARM.X_NEAR + 2.5;
FARM.X_FAR = FARM.X_NEAR - (FARM.COLS - 1) * FARM.X_STEP - 2;
FARM.Z_MIN = FARM.Z0 - 2;
FARM.Z_MAX = FARM.Z0 + (FARM.ROWS - 1) * FARM.Z_STEP + 2;

export function teepeePositions() {
  const out = [];
  for (let row = 0; row < FARM.ROWS; row++) {
    for (let col = 0; col < FARM.COLS; col++) {
      out.push({ x: FARM.X_NEAR - col * FARM.X_STEP, z: FARM.Z0 + row * FARM.Z_STEP, row, col });
    }
  }
  return out;
}

export const FARM_PALMS = [
  { position: [FARM.X_GATE + 1.1, 0, FARM.AISLE_Z - 2.4], rotation: 0.4 },
  { position: [FARM.X_GATE + 1.1, 0, FARM.AISLE_Z + 2.6], rotation: -0.6, height: 5.6 },
  { position: [FARM.X_GATE + 1.1, 0, -16], rotation: 2.4, height: 4.6 },
  { position: [FARM.X_FAR - 2, 0, 0], rotation: 1, height: 6 },
  { position: [FARM.X_FAR - 2, 0, 14], rotation: -2 },
];

// ---- Chick ranges ----
export const RANGE_SIZE = { W: 9, D: 7, H: 2.2 };
export const RANGES = [
  { position: [2.5, 0, -24], number: 1, seed: 1, label: true },
  { position: [13, 0, -24], number: 2, seed: 2 },
  { position: [23.5, 0, -24], number: 3, seed: 3 },
];

// ---- Trees ----
// Areas where trees must not grow: the building, the farm, the ranges, and the camera's line of sight.
const KEEP_OUT = [
  [-14, 14, -11, 11],
  [-66, -13, -28, 28],
  [-3, 28, -30, -11],
  [-14, 40, 9, 60],
  [12, 60, -4, 60],
];

let trees;
export function treePositions() {
  if (trees) return trees;
  const r = rng(42);
  trees = [];
  let guard = 0;
  while (trees.length < 90 && guard++ < 4000) {
    const x = -60 + r() * 110;
    const z = -45 + r() * 75;
    if (KEEP_OUT.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1)) continue;
    trees.push([x, z, 0.8 + r() * 0.7, r() * Math.PI * 2]);
  }
  return trees;
}

// ---- Indoor furniture footprints [cx, cz, halfX, halfZ] for navigation ----
// Chairs that teammates sit on are left out so they can reach their seats.
export const FURNITURE = [
  [-10.4, -7.8, 0.45, 0.4], // asset rack
  [-6.6, -6.9, 1.1, 0.45], // asset desk
  [0, -7.5, 1.8, 0.5], // monitoring desk
  [7, -5.6, 1.05, 1.05], // radar table
  [4.6, -4.4, 0.15, 0.15], // satellite dish mast
  [10, 0, 0.9, 0.45], // support desk
  [5.55, 3.1, 0.85, 0.4], // data racks
  [7.6, 3.3, 1.0, 1.0], // summary bars
  [7.6, 5.0, 0.9, 0.45], // insights desk
  [9.4, 3.6, 0.15, 0.15], // phone stand
  [1.5, 3.5, 1.4, 0.6], // own desk
  [1.25, 4.45, 0.3, 0.3], // own chair
  [-9.6, 5.2, 0.4, 0.8], // farm ledger desk
  [-9.6, 3.9, 0.3, 0.3], // plant
  [-5.8, 6.2, 0.55, 0.55], // bean bags
  [-3.4, 6.1, 0.55, 0.55],
  [-5.7, 7.7, 0.55, 0.55],
  [-3.5, 7.8, 0.55, 0.55],
  [-4.6, 6.9, 0.5, 0.5], // lounge table
  [3, 7.5, 1.37, 0.76], // ping-pong table
  [10.3, 7.6, 0.5, 1.2], // sofa
  [9.2, 7.6, 0.45, 0.45], // sofa table
  [-9.2, 8.3, 1.5, 0.35], // micro-kitchen
  [-3.4, -8.3, 0.3, 0.3], // plants
  [3.0, -8.3, 0.3, 0.3],
  [-11.3, -8.3, 0.3, 0.3],
  [-11.3, 3.6, 0.3, 0.3],
  [-1.6, 8.4, 0.3, 0.3],
  [6.0, 8.4, 0.3, 0.3],
  [11.4, 4.6, 0.3, 0.3],
  [3.4, 3.0, 0.3, 0.3],
];

// Solid walls [x0, z0, x1, z1]; the front and right sides of the office are open.
export const WALLS = [
  [-12.25, -9.25, 12.25, -8.95],
  [-12.25, -9.25, -11.95, 9.25],
];

export const WORLD_BOUNDS = { x0: -66, x1: 35, z0: -35, z1: 30 };

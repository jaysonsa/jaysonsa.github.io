// Keys currently held down for steering a teammate (WASD / arrow keys while steering).
export const held = new Set();

const MOVE_KEYS = { w: 'up', a: 'left', s: 'down', d: 'right' };

export function moveKey(e) {
  return MOVE_KEYS[e.key.toLowerCase()];
}

// Direction in camera space: x = right, y = forward. Zero when nothing is held.
export function steerVector() {
  let x = 0;
  let y = 0;
  if (held.has('up')) y += 1;
  if (held.has('down')) y -= 1;
  if (held.has('right')) x += 1;
  if (held.has('left')) x -= 1;
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len, active: x !== 0 || y !== 0 };
}

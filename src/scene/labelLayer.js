// drei <Html> elements render into this fixed layer from index.html,
// so their DOM target never changes (avoids a bug where the first label vanished).
export const labelLayer = { current: typeof document !== 'undefined' ? document.getElementById('labels') : null };

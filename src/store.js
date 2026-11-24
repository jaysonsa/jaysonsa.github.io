import { useSyncExternalStore } from 'react';
import { entries } from './content.js';

// Tiny shared store. It works inside and outside the R3F canvas without context bridging.
// A station can be opened directly with a link such as /#anomaly-alerts.
const initial = typeof window !== 'undefined' ? decodeURIComponent(window.location.hash.slice(1)) : '';
const hour = typeof window !== 'undefined' ? new Date().getHours() : 12;
const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
// ?quality=low|medium|high pins the render quality (useful for testing and screenshots).
const forced = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('quality') : null;
export const QUALITY_LOCKED = ['low', 'medium', 'high'].includes(forced);
// Otherwise start a notch lower on phones/tablets and let the performance monitor adjust.
export const MAX_QUALITY = QUALITY_LOCKED ? forced : coarse ? 'medium' : 'high';

let state = { selected: entries[initial] ? initial : null, listView: false, controlled: null, marker: null, spot: null, night: hour >= 18 || hour < 6, quality: MAX_QUALITY, help: false, ready: false };
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  listeners.forEach((l) => l());
}

export function useStore(selector) {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
  );
}

export function select(id) {
  if (id && !entries[id]) id = null;
  setState({ selected: id, spot: null });
  const url = id ? `#${id}` : window.location.pathname + window.location.search;
  window.history.replaceState(null, '', url);
}

export const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

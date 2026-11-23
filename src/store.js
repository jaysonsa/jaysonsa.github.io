import { useSyncExternalStore } from 'react';
import { entries } from './content.js';

// Tiny shared store. It works inside and outside the R3F canvas without context bridging.
// A station can be opened directly with a link such as /#anomaly-alerts.
const initial = typeof window !== 'undefined' ? decodeURIComponent(window.location.hash.slice(1)) : '';
let state = { selected: entries[initial] ? initial : null, listView: false, controlled: null, marker: null };
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
  setState({ selected: id });
  const url = id ? `#${id}` : window.location.pathname + window.location.search;
  window.history.replaceState(null, '', url);
}

export const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

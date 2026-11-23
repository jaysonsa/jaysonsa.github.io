import { lazy, Suspense, useEffect, useMemo } from 'react';
import { getState, select, setState, useStore } from './store.js';
import { entries, ORDER, profile } from './content.js';
import Panel from './ui/Panel.jsx';
import ListView from './ui/ListView.jsx';

const Scene = lazy(() => import('./scene/Scene.jsx'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  const webgl = useMemo(hasWebGL, []);
  const listView = useStore((s) => s.listView) || !webgl;
  const selected = useStore((s) => s.selected);

  useEffect(() => {
    const onKey = (e) => {
      const { selected: current } = getState();
      if (e.key === 'Escape') select(null);
      if (!current || e.target.closest?.('input, textarea')) return;
      const i = ORDER.indexOf(current);
      if (e.key === 'ArrowRight') select(ORDER[(i + 1) % ORDER.length]);
      if (e.key === 'ArrowLeft') select(ORDER[(i - 1 + ORDER.length) % ORDER.length]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-list', listView);
  }, [listView]);

  useEffect(() => {
    document.title = selected ? `${entries[selected].title} · Virtual Office` : 'Virtual Office · jaysonsa';
  }, [selected]);

  return (
    <div className={`app${listView ? ' is-list' : ''}`}>
      {webgl && (
        <Suspense fallback={<div className="loading">Opening the office…</div>}>
          <Scene paused={listView} />
        </Suspense>
      )}
      {listView && <ListView />}

      <header className="topbar">
        <button type="button" className="brand" onClick={() => select(null)}>
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>{profile.name || profile.handle}</strong>
            <small>
              {profile.role}
              <span className="brand-extra"> · Virtual Office</span>
            </small>
          </span>
        </button>
        <nav className="top-actions">
          {webgl && (
            <button type="button" className="btn" onClick={() => setState((s) => ({ listView: !s.listView }))}>
              {listView ? '3D office' : 'List view'}
            </button>
          )}
          <button type="button" className="btn primary" onClick={() => select('contact')}>
            Contact
          </button>
        </nav>
      </header>

      {!listView && !selected && (
        <p className="hint">
          <span className="hint-desktop">Drag to look around · scroll to zoom · click a station</span>
          <span className="hint-touch">Drag to look around · pinch to zoom · tap a station</span>
        </p>
      )}

      <Panel />
    </div>
  );
}

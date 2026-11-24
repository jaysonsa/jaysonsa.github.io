import { lazy, Suspense, useEffect, useMemo } from 'react';
import { getState, select, setState, useStore } from './store.js';
import { entries, ORDER, profile } from './content.js';
import { held, moveKey } from './input.js';
import Panel from './ui/Panel.jsx';
import ControlBar from './ui/ControlBar.jsx';
import ListView from './ui/ListView.jsx';
import HelpModal from './ui/HelpModal.jsx';

const Scene = lazy(() => import('./scene/Scene.jsx'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const typing = (e) => e.target.closest?.('input, textarea, [contenteditable]');

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="12" y1="2.5" x2="12" y2="5" transform={`rotate(${a} 12 12)`} />
        ))}
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const webgl = useMemo(hasWebGL, []);
  const listView = useStore((s) => s.listView) || !webgl;
  const selected = useStore((s) => s.selected);
  const controlled = useStore((s) => s.controlled);
  const spot = useStore((s) => s.spot);
  const night = useStore((s) => s.night);
  const help = useStore((s) => s.help);
  const ready = useStore((s) => s.ready);

  // Keyboard: navigation, toggles, and WASD steering.
  useEffect(() => {
    const onDown = (e) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const s = getState();
      const dir = moveKey(e);
      if (dir && s.controlled) {
        held.add(dir);
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        if (s.help) setState({ help: false });
        else if (s.controlled) setState({ controlled: null });
        else if (s.spot) setState({ spot: null });
        else select(null);
        return;
      }
      if (e.key === '?') setState({ help: !s.help });
      if (e.key.toLowerCase() === 'n') setState({ night: !s.night });
      if (e.key.toLowerCase() === 'l' && webgl) setState({ listView: !s.listView });
      if (!s.selected) return;
      const i = ORDER.indexOf(s.selected);
      if (e.key === 'ArrowRight') select(ORDER[(i + 1) % ORDER.length]);
      if (e.key === 'ArrowLeft') select(ORDER[(i - 1 + ORDER.length) % ORDER.length]);
    };
    const onUp = (e) => {
      const dir = moveKey(e);
      if (dir) held.delete(dir);
    };
    const clear = () => held.clear();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', clear);
    };
  }, [webgl]);

  useEffect(() => {
    if (!controlled) held.clear();
  }, [controlled]);

  // Fade out the static boot screen from index.html once the scene has drawn (or immediately without WebGL).
  useEffect(() => {
    if (!ready && webgl && !listView) return undefined;
    const boot = document.getElementById('boot');
    if (!boot) return undefined;
    boot.classList.add('is-done');
    const t = setTimeout(() => boot.remove(), 700);
    return () => clearTimeout(t);
  }, [ready, webgl, listView]);

  useEffect(() => {
    document.body.classList.toggle('is-list', listView);
  }, [listView]);

  useEffect(() => {
    document.body.classList.toggle('is-controlling', Boolean(controlled));
  }, [controlled]);

  useEffect(() => {
    document.documentElement.dataset.night = night ? 'true' : 'false';
  }, [night]);

  useEffect(() => {
    document.title = selected ? `${entries[selected].title} · Virtual Office` : 'Virtual Office · jaysonsa';
  }, [selected]);

  return (
    <div className={`app${listView ? ' is-list' : ''}`}>
      {webgl && (
        <Suspense fallback={null}>
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
          {webgl && !listView && (
            <button
              type="button"
              className="btn icon"
              onClick={() => setState({ night: !night })}
              aria-label={night ? 'Switch to day' : 'Switch to night'}
              title={night ? 'Switch to day (N)' : 'Switch to night (N)'}
            >
              {night ? <SunIcon /> : <MoonIcon />}
            </button>
          )}
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

      {!listView && controlled && <ControlBar />}

      {!listView && spot && !controlled && !selected && (
        <div className="control-bar spot-bar">
          <p>
            <strong>Chick Ranges</strong>
            <span> · JER Gamefarm brooding pens</span>
          </p>
          <button type="button" className="btn primary" onClick={() => setState({ spot: null })}>
            Back to office
          </button>
        </div>
      )}

      {!listView && !selected && !controlled && !spot && (
        <p className="hint">
          <span className="hint-desktop">Click a station to open it · click a person to steer them · press ? for controls</span>
          <span className="hint-touch">Tap a station to open it · tap a person to steer them</span>
        </p>
      )}

      {!listView && (
        <button type="button" className="help-btn" onClick={() => setState({ help: true })} aria-label="Controls and shortcuts">
          ?
        </button>
      )}

      <Panel />
      {help && <HelpModal />}
    </div>
  );
}

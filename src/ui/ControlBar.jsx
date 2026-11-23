import { setState, useStore } from '../store.js';
import { sendHome, TEAM_BY_ID } from '../team.js';
import { entries } from '../content.js';

// Shown while the visitor is steering a teammate.
export default function ControlBar() {
  const id = useStore((s) => s.controlled);
  const m = TEAM_BY_ID[id];
  if (!m) return null;
  return (
    <div className="control-bar" role="status" style={{ '--tag': m.accent }}>
      <span className="control-dot" aria-hidden="true" />
      <p>
        <strong>{m.name}</strong>
        <span className="control-help-desktop"> · click anywhere to walk there</span>
        <span className="control-help-touch"> · tap where to go</span>
      </p>
      <button type="button" className="btn ghost" onClick={() => sendHome(m.id)}>
        Back to desk
      </button>
      <button type="button" className="btn ghost" onClick={() => setState({ controlled: null, selected: m.station })}>
        {entries[m.station].title}
      </button>
      <button type="button" className="btn primary" onClick={() => setState({ controlled: null })}>
        Done
      </button>
    </div>
  );
}

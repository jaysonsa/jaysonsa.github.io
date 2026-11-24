import { useEffect, useRef } from 'react';
import { setState } from '../store.js';

const SHORTCUTS = [
  ['Click a station', 'Open its case study'],
  ['Click a person', 'Take control of that teammate'],
  ['Click the floor', 'Walk the teammate there (they route around obstacles)'],
  ['W A S D', 'Steer the teammate directly'],
  ['← →', 'Previous / next case study'],
  ['N', 'Toggle day and night'],
  ['L', 'Switch between 3D and list view'],
  ['Esc', 'Close, stop steering, or go back'],
  ['?', 'Show this help'],
];

export default function HelpModal() {
  const closeRef = useRef();
  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  const close = () => setState({ help: false });
  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel-head">
          <div>
            <p className="eyebrow">Controls</p>
            <h2 id="help-title">How to explore</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={close} aria-label="Close">
            ✕
          </button>
        </header>
        <dl className="shortcuts">
          {SHORTCUTS.map(([k, v]) => (
            <div key={k}>
              <dt>
                <kbd>{k}</kbd>
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="modal-note">
          Rendering quality adapts to your device automatically. Motion is reduced if your system asks for it.
        </p>
      </div>
    </div>
  );
}

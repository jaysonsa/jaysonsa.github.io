import { select } from '../store.js';
import { entries, ORDER, profile } from '../content.js';

// Plain 2D version of the office for quick skimming, small devices, or no WebGL.
export default function ListView() {
  return (
    <main className="list-view">
      <div className="list-inner">
        <p className="eyebrow">{profile.role}</p>
        <h1>{profile.name || profile.handle}</h1>
        <p className="lead">{profile.intro}</p>
        <div className="cards">
          {ORDER.filter((id) => id !== 'about').map((id) => {
            const e = entries[id];
            return (
              <button key={id} type="button" className="card" onClick={() => select(id)}>
                <span className="eyebrow">{e.kind}</span>
                <strong>{e.title}</strong>
                <span>{e.tagline}</span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

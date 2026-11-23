import { useEffect, useRef } from 'react';
import { select, setState, useStore } from '../store.js';
import { TEAM_BY_STATION } from '../team.js';
import { entries, ORDER, profile } from '../content.js';
import Demo from './Demo.jsx';

function ProjectBody({ e }) {
  return (
    <>
      <section>
        <h3>Problem</h3>
        <p>{e.problem}</p>
      </section>
      <section>
        <h3>Solution</h3>
        <p>{e.solution}</p>
      </section>
      {e.highlights && (
        <section>
          <h3>Engineering highlights</h3>
          <ul className="ticks">
            {e.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      )}
      {e.features?.map((f) => (
        <section key={f.title} className="feature">
          <h3>{f.title}</h3>
          <ul className="ticks">
            {f.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ))}
      <section>
        <h3>Impact</h3>
        <ul className="ticks">
          {e.impact.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>
      {e.tech.length > 0 && (
        <section>
          <h3>Tech</h3>
          <ul className="chips">
            {e.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3>Demo</h3>
        <Demo type={e.demo} />
      </section>
    </>
  );
}

function AboutBody() {
  return (
    <>
      <p className="lead">{profile.intro}</p>
      <section>
        <h3>In this office</h3>
        <ul className="ticks">
          {ORDER.filter((id) => entries[id].type === 'project').map((id) => (
            <li key={id}>
              <button type="button" className="link" onClick={() => select(id)}>
                {entries[id].title}
              </button>
              : {entries[id].tagline}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>A note on work projects</h3>
        <p>
          Work projects are shown with generic names and mock data. No company code, assets, or internal details are
          included.
        </p>
      </section>
    </>
  );
}

function SkillsBody({ e }) {
  return e.groups.map((g) => (
    <section key={g.name}>
      <h3>{g.name}</h3>
      <ul className="chips">
        {g.items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  ));
}

function ContactBody() {
  const { github, linkedin, email } = profile.links;
  return (
    <ul className="contact">
      {github && (
        <li>
          <a href={github} target="_blank" rel="noreferrer">
            GitHub <span>{github.replace('https://', '')}</span>
          </a>
        </li>
      )}
      {linkedin && (
        <li>
          <a href={linkedin} target="_blank" rel="noreferrer">
            LinkedIn <span>{linkedin.replace('https://', '')}</span>
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`}>
            Email <span>{email}</span>
          </a>
        </li>
      )}
    </ul>
  );
}

export default function Panel() {
  const selected = useStore((s) => s.selected);
  const closeRef = useRef();

  useEffect(() => {
    if (selected) closeRef.current?.focus({ preventScroll: true });
  }, [selected]);

  if (!selected) return null;
  const e = entries[selected];
  const idx = ORDER.indexOf(selected);
  const prev = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
  const next = ORDER[(idx + 1) % ORDER.length];

  return (
    <aside className="panel" role="dialog" aria-labelledby="panel-title" key={selected}>
      <header className="panel-head">
        <div>
          <p className="eyebrow">{e.kind}</p>
          <h2 id="panel-title">{e.title}</h2>
          <p className="tagline">{e.tagline}</p>
          {e.teammate && (
            <p className="teammate">
              <span aria-hidden="true" />
              Virtual teammate: <strong>{e.teammate}</strong>
              <button
                type="button"
                className="link control-link"
                onClick={() => setState({ controlled: TEAM_BY_STATION[selected].id, selected: null })}
              >
                Walk around with {e.teammate} →
              </button>
            </p>
          )}
        </div>
        <button ref={closeRef} type="button" className="icon-btn" onClick={() => select(null)} aria-label="Close">
          ✕
        </button>
      </header>
      <div className="panel-body">
        {e.type === 'project' && <ProjectBody e={e} />}
        {e.type === 'about' && <AboutBody />}
        {e.type === 'skills' && <SkillsBody e={e} />}
        {e.type === 'contact' && <ContactBody />}
      </div>
      <footer className="panel-foot">
        <button type="button" className="btn ghost" onClick={() => select(prev)}>
          ← {entries[prev].title}
        </button>
        <button type="button" className="btn ghost" onClick={() => select(next)}>
          {entries[next].title} →
        </button>
      </footer>
    </aside>
  );
}

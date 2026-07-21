import { useState } from 'react';
import type { FormEvent } from 'react';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';

const surfaces: Surface[] = ['Today', 'Explore', 'People', 'Systems', 'Library', 'You'];

export function App() {
  const [surface, setSurface] = useState<Surface>('Today');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = message.trim();
    if (!clean) return;
    setStatus('Sovereign is connecting the right context…');
    try {
      const response = await fetch('/api/v1/threads/demo/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': crypto.randomUUID()
        },
        body: JSON.stringify({ message: clean, context: { surface } })
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const data = await response.text();
      setStatus(data || 'The thread is ready.');
      setMessage('');
    } catch {
      setStatus('The secure agent connection is not configured yet. Your message was not saved.');
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">SOVEREIGN.OS</span>
          <h1>{surface}</h1>
        </div>
        <button className="profile-button" aria-label="Open account settings">CO</button>
      </header>

      <main>
        {surface === 'Today' && (
          <section className="stack" aria-labelledby="today-title">
            <article className="hero-card">
              <span className="eyebrow">TODAY</span>
              <h2 id="today-title">Pressure can get louder without becoming truth.</h2>
              <p>Your Baseline stays yours. Current conditions may change what feels urgent, visible, or difficult to ignore.</p>
              <div className="state-grid">
                <State label="Baseline tendency" value="You look for the whole picture before committing." />
                <State label="Current amplification" value="Urgency may be louder than usual." />
                <State label="Known behavior" value="Nothing assumed." />
                <State label="Actual state" value="Only you can confirm it." />
              </div>
            </article>

            <article className="check-card">
              <h3>Does this match today?</h3>
              <div className="choice-row" role="group" aria-label="Does this match today?">
                <button>Yes</button><button>Partly</button><button>Not today</button>
              </div>
            </article>
          </section>
        )}

        {surface !== 'Today' && (
          <section className="empty-state">
            <span className="eyebrow">{surface.toUpperCase()}</span>
            <h2>{surfaceCopy[surface].title}</h2>
            <p>{surfaceCopy[surface].body}</p>
          </section>
        )}
      </main>

      <form className="composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="sovereign-message">Ask Sovereign</label>
        <textarea
          id="sovereign-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask Sovereign…"
          rows={1}
        />
        <button type="submit" aria-label="Send message">↑</button>
        {status && <p className="composer-status" aria-live="polite">{status}</p>}
      </form>

      <nav className="tabbar" aria-label="Primary navigation">
        {surfaces.map((item) => (
          <button key={item} className={surface === item ? 'active' : ''} onClick={() => setSurface(item)}>
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}

function State({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

const surfaceCopy: Record<Exclude<Surface, 'Today'>, { title: string; body: string }> = {
  Explore: { title: 'This is not a label. It is a map.', body: 'Explore how you decide, learn, communicate, love, express, and respond under pressure.' },
  People: { title: 'Different is not wrong.', body: 'Add people privately. Compare only what consent allows. Translate friction without assigning blame.' },
  Systems: { title: 'A relationship never exists alone.', body: 'See how roles, authority, history, dependence, and shared goals change what an interaction means.' },
  Library: { title: 'Keep what helps.', body: 'Save understanding you choose. Nothing becomes permanent simply because it was said.' },
  You: { title: 'Private context stays yours.', body: 'Control your Baseline, location, people, consent, billing, export, deletion, and accessibility.' }
};

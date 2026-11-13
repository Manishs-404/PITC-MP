import React, { useState } from 'react';
import Icon from './Icon';

const TIPS = [
  { t: 'Tu vs. Aap', d: 'Use आप with seniors and anyone you have just met. तू is for very close friends only.' },
  { t: 'Add a respectful address', d: 'Opening with “Sir” or “महोदय” softens requests and signals deference to leadership.' },
  { t: 'Mind the idioms', d: 'Word-for-word idioms rarely survive translation. Say what you mean in plain terms.' },
  { t: 'Check gender agreement', d: 'Verbs in Hindi change with the speaker: आ रहा हूँ (male) vs. आ रही हूँ (female).' },
  { t: 'Respect prayer times', d: 'Avoid scheduling with Arabic-speaking teams around Friday midday prayers.' },
  { t: 'Soften commands', d: 'Turn “Do this by tonight” into a polite request: “Could you share it by this evening?”' },
  { t: 'Match the tone to the role', d: 'Formal for seniors, semi-formal for peers, informal only with juniors and friends.' },
];

const ROLES = [
  { id: 'senior', label: 'Senior', hint: 'Formal' },
  { id: 'peer', label: 'Peer', hint: 'Semi-formal' },
  { id: 'junior', label: 'Junior', hint: 'Informal' },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export default function HomePage({ threads, onNavigate, onOpenChat, onQuickDraft }) {
  const list = Object.values(threads);
  const [draft, setDraft] = useState('');
  const [role, setRole] = useState('senior');
  const checked = list.reduce((n, t) => n + (t.checked || 0), 0);
  const flagged = list.reduce((n, t) => n + (t.flagged || 0), 0);
  const tip = TIPS[Math.floor(Date.now() / 86400000) % TIPS.length];

  const submit = () => {
    if (draft.trim()) onQuickDraft(role, draft.trim());
  };

  return (
    <section className="page page-home">
      <div className="home-in">
        <div className="hero">
          <h1>{greeting()} 👋<br />Say it right, in any culture.</h1>
          <div className="acts">
            <button className="btn primary" onClick={() => onNavigate('chats')}><Icon name="chat" />Open Text Chat</button>
            <button className="btn ghost" onClick={() => onNavigate('voice')}><Icon name="mic" />Start Voice Coach</button>
          </div>
          <div className="hstats">
            <div><b>{list.length}</b><span>Conversations</span></div>
            <div><b>{checked}</b><span>Drafts checked</span></div>
            <div><b>{flagged}</b><span>Risks flagged</span></div>
          </div>
        </div>

        <div className="two">
          <div className="card quick">
            <div className="sec-h"><h3>Quick coach</h3></div>
            <div className="q-body">
              <div className="q-roles">
                {ROLES.map((r) => (
                  <button key={r.id} className={role === r.id ? 'on' : ''} onClick={() => setRole(r.id)}>
                    {r.label}<small>{r.hint}</small>
                  </button>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
                placeholder="Type a message you're about to send…"
                rows={3}
              />
              <button className="btn primary" onClick={submit} disabled={!draft.trim()}><Icon name="shield" />Coach this message</button>
            </div>
          </div>

          <div className="card tipcard">
            <div className="sec-h"><h3>💡 Tip of the day</h3></div>
            <div className="tip-body">
              <b>{tip.t}</b>
              <p>{tip.d}</p>
              <a onClick={() => onNavigate('crt')}>Explore the CRT guide →</a>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="sec-h"><h3>Recent conversations</h3><a onClick={() => onNavigate('chats')}>View all</a></div>
          <div className="recent">
            {list.slice(0, 4).map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <div key={t.id} className="rrow" onClick={() => onOpenChat(t.id)}>
                  <div className="av">{t.avatar}</div>
                  <div className="t">
                    <b>{t.name} · <span className={`role ${t.role}`}>{t.roleLabel}</span></b>
                    <span>{last ? last.text : 'No messages yet'}</span>
                  </div>
                  <small style={{ color: 'var(--muted)' }}>{last?.time}</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

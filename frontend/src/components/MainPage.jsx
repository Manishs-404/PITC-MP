import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import HomePage from './HomePage';
import ChatApp from './ChatApp';
import SpeechTranslator from './SpeechTranslator';
import CrtGuide from './CrtGuide';
import SettingsPage from './SettingsPage';
import { INITIAL_ROLE_CHATS } from '../data/chats';

const PAGES = {
  home: ['Home', 'Proactive Intelligent Translation Coach'],
  chats: ['Text Chat', 'Role-calibrated conversations with a pre-send CRT guardrail'],
  voice: ['Voice Coach', 'Bidirectional speech-to-speech with tone calibration'],
  crt: ['CRT Guide', 'Cultural Risk Taxonomy – five dimensions of pragmatic risk'],
  set: ['Settings', 'Engine, language, voice and appearance'],
};

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'chats', label: 'Chats', icon: 'chat' },
  { id: 'voice', label: 'Voice', icon: 'mic' },
  { id: 'crt', label: 'CRT Guide', icon: 'shield' },
];

const SETTINGS_KEY = 'pitc.settings';
const DEFAULT_SETTINGS = {
  provider: 'auto',
  theme: 'dark',
  defaultScript: 'hi',
  defaultTone: 'polite',
  autoSpeak: true,
  speechRate: 0.92,
  showReactions: true,
};

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function MainPage() {
  const [page, setPage] = useState('home');
  const [settings, setSettings] = useState(loadSettings);
  const [chatThreads, setChatThreads] = useState(INITIAL_ROLE_CHATS);
  const [activeChatId, setActiveChatId] = useState('senior');
  const [pastedText, setPastedText] = useState('');

  const updateSetting = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch { /* storage unavailable – ignore */ }
  }, [settings]);

  const unreadTotal = Object.values(chatThreads).reduce((n, t) => n + (t.unread || 0), 0);

  const openChat = (id) => {
    setActiveChatId(id);
    setChatThreads((prev) => ({ ...prev, [id]: { ...prev[id], unread: 0 } }));
    setPage('chats');
  };

  const createChat = (role) => {
    const base = INITIAL_ROLE_CHATS[role];
    const id = `${role}-${Date.now()}`;
    setChatThreads((prev) => ({ [id]: { ...base, id, name: `New chat · ${base.roleLabel.split(' / ')[0]}`, title: base.title, unread: 0, checked: 0, flagged: 0, messages: [] }, ...prev }));
    setActiveChatId(id);
    setPage('chats');
  };

  const updateThread = (id, patch) =>
    setChatThreads((prev) => ({ ...prev, [id]: { ...prev[id], ...(typeof patch === 'function' ? patch(prev[id]) : patch) } }));

  const [title] = PAGES[page];

  return (
    <div className="shell">
      <nav className="rail">
        <div className="logo">P</div>
        {NAV.map((n) => (
          <button key={n.id} className={`nav ${page === n.id ? 'on' : ''}`} onClick={() => setPage(n.id)}>
            <Icon name={n.icon} size={24} />
            {n.label}
            {n.id === 'chats' && unreadTotal > 0 && <span className="dot">{unreadTotal}</span>}
          </button>
        ))}
        <div className="sp" />
        <button className={`nav ${page === 'set' ? 'on' : ''}`} onClick={() => setPage('set')}>
          <Icon name="settings" size={24} />
          Settings
        </button>
        <div className="me" title="You">ME</div>
      </nav>

      <div className="content">
        <header className="topbar">
          <div className="crumbs">
            <h2>{title}</h2>
          </div>
          <button
            className="tbtn"
            title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
          >
            <Icon name="theme" />
          </button>
        </header>

        <main className="pages">
          {page === 'home' && <HomePage threads={chatThreads} onNavigate={setPage} onOpenChat={openChat} onQuickDraft={(role, text) => { setActiveChatId(role); setPastedText(text); setPage('chats'); }} />}
          {page === 'chats' && (
            <ChatApp
              threads={chatThreads}
              activeChatId={activeChatId}
              onSelectChat={openChat}
              onNewChat={createChat}
              onUpdateThread={updateThread}
              settings={settings}
              initialDraft={pastedText}
              onDraftConsumed={() => setPastedText('')}
            />
          )}
          {page === 'voice' && (
            <SpeechTranslator
              settings={settings}
              onInsertToChat={(text) => {
                setPastedText(text);
                setPage('chats');
              }}
            />
          )}
          {page === 'crt' && <CrtGuide />}
          {page === 'set' && <SettingsPage settings={settings} onChange={updateSetting} />}
        </main>
      </div>
    </div>
  );
}

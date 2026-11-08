import React, { useState, useEffect } from 'react';

// Seed conversation threads for each recipient role
const INITIAL_ROLE_CHATS = {
  senior: {
    id: 'senior',
    title: 'Dr. Rajesh Sharma (Director)',
    role: 'senior',
    roleLabel: 'Superior / Senior',
    targetTone: 'Formal (Aap / Neenga)',
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700',
    avatar: '👨‍💼',
    messages: [
      { speaker: 'Dr. Rajesh', text: 'कल सुबह 10 बजे बोर्ड मीटिंग में प्रोजेक्ट की स्थिति की समीक्षा होगी।' },
      { speaker: 'You', text: 'जी महोदय, हमने सभी स्लाइड्स तैयार कर ली हैं।' },
      { speaker: 'Dr. Rajesh', text: 'उत्तम। कृपया अंतिम रिपोर्ट का मसौदा आज शाम तक अवश्य प्रस्तुत कर दें।' }
    ]
  },
  peer: {
    id: 'peer',
    title: 'Priya Verma (Product Lead)',
    role: 'peer',
    roleLabel: 'Peer / Colleague',
    targetTone: 'Semi-Formal / Polite',
    badgeColor: 'bg-sky-900/60 text-sky-300 border-sky-700',
    avatar: '👩‍💻',
    messages: [
      { speaker: 'Priya', text: 'अरे, क्या तुम्हें API एंडपॉइंट्स का नया दस्तावेज़ मिल गया?' },
      { speaker: 'You', text: 'हाँ, मैंने देख लिया है। सब ठीक लग रहा है।' },
      { speaker: 'Priya', text: 'बढ़िया! क्या हम 4 बजे एक बार सिंक-अप कॉल कर सकते हैं?' }
    ]
  },
  junior: {
    id: 'junior',
    title: 'Arun Kumar (Intern / Team)',
    role: 'junior',
    roleLabel: 'Subordinate / Friend',
    targetTone: 'Informal / Casual (Tum / Tu)',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    avatar: '🧑‍🎓',
    messages: [
      { speaker: 'Arun', text: 'भैया, मैंने PR सबमिट कर दिया है। जब समय मिले एक बार देख लेना।' },
      { speaker: 'You', text: 'शानदार काम, अरुण। मैं अभी चेक करता हूँ।' },
      { speaker: 'Arun', text: 'थैंक्स! अगर कोई बदलाव करना हो तो बता देना।' }
    ]
  }
};

export default function ChatApp({ provider = 'auto', initialDraft = '', onBackToHome }) {
  // Session memory for conversation threads
  const [chatThreads, setChatThreads] = useState(INITIAL_ROLE_CHATS);
  // Active chat ID: null represents the Chat Selection Hub; otherwise 'senior' | 'peer' | 'junior'
  const [activeChatId, setActiveChatId] = useState('senior');
  
  const [draft, setDraft] = useState(initialDraft);
  const [language, setLanguage] = useState('hi');
  const [coachResult, setCoachResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedToneTab, setSelectedToneTab] = useState('formal');

  useEffect(() => {
    if (initialDraft) {
      setDraft(initialDraft);
    }
  }, [initialDraft]);

  const activeChat = activeChatId ? chatThreads[activeChatId] : null;

  // On-demand Cultural Risk Coaching
  const handleCoachDraft = async () => {
    if (!draft.trim() || !activeChat) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:8000/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_message: draft,
          language_code: language,
          recipient_role: activeChat.role,
          provider: provider
        })
      });

      if (!res.ok) throw new Error('Coaching check failed');
      const data = await res.json();
      setCoachResult(data);
    } catch (err) {
      console.error('Coaching error:', err);
      alert('Coaching check failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyCalibratedVariant = (text) => {
    setDraft(text);
  };

  const handleSendMessage = () => {
    if (!draft.trim() || !activeChatId) return;

    // Persist new message in current session memory for this role thread
    setChatThreads((prev) => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, { speaker: 'You', text: draft }]
      }
    }));

    setDraft('');
    setCoachResult(null);
  };

  // -------------------------------------------------------------
  // VIEW 1: CHAT SELECTION HUB (When no specific chat is active)
  // -------------------------------------------------------------
  if (!activeChatId) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex flex-col justify-center min-h-[80vh]">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💬</span> Choose a Conversation Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a thread calibrated to a specific organizational hierarchy and sociopragmatic register.
            </p>
          </div>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3.5 py-1.5 bg-[#182229] hover:bg-[#202c33] border border-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition-colors"
            >
              ← Home Page
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.values(chatThreads).map((thread) => {
            const lastMsg = thread.messages[thread.messages.length - 1];
            return (
              <div
                key={thread.id}
                onClick={() => {
                  setActiveChatId(thread.id);
                  setCoachResult(null);
                }}
                className="bg-[#111b21] hover:bg-[#152028] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{thread.avatar}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${thread.badgeColor}`}>
                      {thread.roleLabel}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm mb-1">{thread.title}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium mb-3">Target: {thread.targetTone}</p>

                  <div className="bg-[#182229] p-2.5 rounded-xl border border-slate-800/80 mb-3">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Last Exchange:</span>
                    <p className="text-xs text-slate-200 italic line-clamp-2">
                      "{lastMsg ? lastMsg.text : 'No messages yet'}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <span>{thread.messages.length} messages</span>
                  <span className="text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                    Open Chat →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ACTIVE CONVERSATION WITH CRT COACHING
  // -------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] max-w-4xl mx-auto w-full border-x border-slate-800">
      {/* Top Conversation Header */}
      <div className="bg-[#111b21] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button to switch chats */}
          <button
            onClick={() => setActiveChatId(null)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white bg-[#182229] hover:bg-[#202c33] border border-slate-700 px-2.5 py-1.5 rounded-xl transition-colors"
            title="Return to Chat Selection Hub"
          >
            <span>←</span>
            <span>All Chats</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeChat.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">{activeChat.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${activeChat.badgeColor}`}>
                  {activeChat.roleLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enforcing Register: <strong className="text-emerald-400">{activeChat.targetTone}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Language script picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Script:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#1f2c34] text-emerald-400 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none"
          >
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="ar">Arabic (العربية)</option>
          </select>
        </div>
      </div>

      {/* Message Feed for active thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeChat.messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.speaker === 'You' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[10px] text-slate-500 mb-0.5">{m.speaker}</span>
            <div
              className={`p-3 rounded-2xl max-w-md text-sm leading-relaxed ${
                m.speaker === 'You'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/60'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* 3-Tone Formality Coaching Panel */}
      {coachResult && (
        <div className="mx-4 mb-3 bg-[#111b21] border border-slate-700/80 rounded-2xl p-4 shadow-xl animate-slide-up">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                  coachResult.risk_level === 'red'
                    ? 'bg-red-950/80 text-red-300 border-red-700/60'
                    : coachResult.risk_level === 'amber'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                }`}>
                  {coachResult.crt_code ? `CRT Violation: ${coachResult.crt_code}` : 'Tone Verified'}
                </span>
                <span className="text-xs text-slate-400">Active Role: <strong className="text-white capitalize">{activeChat.role}</strong></span>
              </div>
              <p className="text-xs text-slate-200 mt-1.5 font-medium">
                {coachResult.warning_message || 'Draft evaluated for sociopragmatic alignment.'}
              </p>
            </div>
            <button
              onClick={() => setCoachResult(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          {/* 3 Calibrated Tone Cards */}
          {coachResult.variants && (
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                Select Calibrated Tone Variant:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {/* Formal */}
                <div
                  onClick={() => {
                    setSelectedToneTab('formal');
                    applyCalibratedVariant(coachResult.variants.formal);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedToneTab === 'formal'
                      ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/40 shadow'
                      : 'bg-[#182229] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-300">Formal</span>
                      <span className="text-[10px] bg-purple-900/50 text-purple-200 px-1.5 py-0.2 rounded">
                        High Deference
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium mb-2 leading-relaxed">
                      "{coachResult.variants.formal}"
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 italic border-t border-slate-800/80 pt-1.5 mt-auto">
                    {coachResult.predicted_reactions?.formal_reaction || 'Perceived as respectful and hierarchical.'}
                  </p>
                </div>

                {/* Semi-Formal */}
                <div
                  onClick={() => {
                    setSelectedToneTab('semi_formal');
                    applyCalibratedVariant(coachResult.variants.semi_formal);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedToneTab === 'semi_formal'
                      ? 'bg-sky-950/30 border-sky-500 ring-1 ring-sky-500/40 shadow'
                      : 'bg-[#182229] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-sky-300">Semi-Formal</span>
                      <span className="text-[10px] bg-sky-900/50 text-sky-200 px-1.5 py-0.2 rounded">
                        Polite / Balanced
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium mb-2 leading-relaxed">
                      "{coachResult.variants.semi_formal}"
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 italic border-t border-slate-800/80 pt-1.5 mt-auto">
                    {coachResult.predicted_reactions?.semi_formal_reaction || 'Standard polite workplace register.'}
                  </p>
                </div>

                {/* Informal */}
                <div
                  onClick={() => {
                    setSelectedToneTab('casual');
                    applyCalibratedVariant(coachResult.variants.casual);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedToneTab === 'casual'
                      ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 shadow'
                      : 'bg-[#182229] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-300">Informal</span>
                      <span className="text-[10px] bg-emerald-900/50 text-emerald-200 px-1.5 py-0.2 rounded">
                        Peer / Direct
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium mb-2 leading-relaxed">
                      "{coachResult.variants.casual}"
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 italic border-t border-slate-800/80 pt-1.5 mt-auto">
                    {coachResult.predicted_reactions?.casual_reaction || 'Close peer register; friendly and direct.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Composer Input Bar */}
      <div className="p-3 bg-[#111b21] border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Draft message for ${activeChat.title.split(' ')[0]}...`}
          className="flex-1 bg-[#202c33] text-white text-sm rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
        />

        {/* Coach Me Button */}
        <button
          onClick={handleCoachDraft}
          disabled={!draft.trim() || isAnalyzing}
          className="flex items-center gap-1.5 bg-[#182229] hover:bg-[#202c33] text-amber-300 border border-amber-500/40 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-40"
          title="Analyze draft and calibrate across Formal, Semi-Formal, and Informal tones"
        >
          {isAnalyzing ? (
            <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span>🛡️</span>
          )}
          <span>Coach Me</span>
        </button>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!draft.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
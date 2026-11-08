import React, { useState } from 'react';
import ChatApp from './ChatApp';
import SpeechTranslator from './SpeechTranslator';

export default function MainPage() {
  const [activeMode, setActiveMode] = useState('landing');
  const [activeProvider, setActiveProvider] = useState('auto');
  const [speechPastedText, setSpeechPastedText] = useState('');

  return (
    <div className="min-h-screen bg-[#0b141a] text-slate-100 flex flex-col font-sans">
      <header className="h-16 border-b border-slate-800 bg-[#111b21] px-6 flex items-center justify-between z-10">
        <div
          onClick={() => setActiveMode('landing')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-emerald-900/30">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100">PITC</h1>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                v2.0 Hybrid
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Proactive Intelligent Translation Coach</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeMode !== 'landing' && (
            <div className="flex bg-[#202c33] p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setActiveMode('text')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeMode === 'text'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>💬</span>
                <span>Text Chat</span>
              </button>
              <button
                onClick={() => setActiveMode('speech')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeMode === 'speech'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎙️</span>
                <span>Voice Coach</span>
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 bg-[#182229] border border-slate-700/80 px-2.5 py-1 rounded-xl text-xs text-slate-300">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Engine:</span>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value)}
              className="bg-transparent text-emerald-400 font-medium focus:outline-none cursor-pointer"
            >
              <option value="auto" className="bg-[#1e293b] text-white">Auto (Gemini ⇄ Aya 8B)</option>
              <option value="cloud" className="bg-[#1e293b] text-white">Cloud Only (Gemini)</option>
              <option value="local" className="bg-[#1e293b] text-white">Local Only (Ollama)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {activeMode === 'landing' && (
          <div className="w-full max-w-4xl px-6 py-12 flex flex-col items-center text-center z-10">
            <div className="inline-flex items-center gap-2 bg-[#182229] border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cultural Risk Taxonomy (CRT) Activated</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Communicate Across Cultures with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Zero Pragmatic Friction</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mb-10 leading-relaxed">
              Detect honorific mismatches, hierarchy risks, and sociopragmatic friction before transmission across Hindi, Tamil, Kannada, and Arabic. Choose your modality:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <div
                onClick={() => setActiveMode('text')}
                className="group relative bg-[#111b21] hover:bg-[#152028] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-7 text-left transition-all duration-200 cursor-pointer shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    💬
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
                    Text Chat Guardrail
                    <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    WhatsApp-style messaging with real-time keystroke interception. Flags inappropriate T-V pronouns (Tu vs. Aap) and provides one-click calibrated swaps.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-800/80">
                  <span className="text-[10px] bg-[#1f2c34] text-slate-300 px-2 py-0.5 rounded">Pre-Send Hook</span>
                  <span className="text-[10px] bg-[#1f2c34] text-slate-300 px-2 py-0.5 rounded">CRT Checks</span>
                </div>
              </div>

              <div
                onClick={() => setActiveMode('speech')}
                className="group relative bg-[#111b21] hover:bg-[#152028] border border-slate-800 hover:border-sky-500/50 rounded-2xl p-7 text-left transition-all duration-200 cursor-pointer shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    🎙️
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
                    Bidirectional Voice Coach
                    <span className="text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Live speech-to-speech translation with tone calibration. Speak naturally and adapt output between Polite, Traditional, and Casual registers.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-800/80">
                  <span className="text-[10px] bg-[#1f2c34] text-slate-300 px-2 py-0.5 rounded">Push-To-Talk</span>
                  <span className="text-[10px] bg-[#1f2c34] text-slate-300 px-2 py-0.5 rounded">Tone Calibration</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMode === 'text' && (
  <ChatApp 
    provider={activeProvider} 
    initialDraft={speechPastedText} 
    onBackToHome={() => setActiveMode('landing')}
  />
)}

        {activeMode === 'speech' && (
          <div className="w-full max-w-xl p-4">
            <SpeechTranslator
              provider={activeProvider}
              onClose={() => setActiveMode('landing')}
              onInsertToChat={(text) => {
                setSpeechPastedText(text);
                setActiveMode('text');
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
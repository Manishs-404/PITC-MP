import React, { useState, useEffect, useRef } from 'react';

const BCP_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ar: 'ar-SA'
};

const LANG_OPTIONS = [
  { code: 'en', label: 'English (US)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ar', label: 'Arabic (العربية)' }
];

export default function SpeechTranslator({ provider = 'auto', onClose, onInsertToChat }) {
  const [langA, setLangA] = useState('en');
  const [langB, setLangB] = useState('hi');
  const [tone, setTone] = useState('polite');
  const [isRecording, setIsRecording] = useState(null); // 'A' | 'B' | null
  const [transcribedText, setTranscribedText] = useState('');
  const [translatedResult, setTranslatedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);
  // Use a ref so the speech callback always reads the live speaker without stale state closures
  const activeSpeakerRef = useRef(null);

  // Load and cache browser TTS voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        voicesRef.current = window.speechSynthesis.getVoices();
      }
    };
    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        const currentSpeaker = activeSpeakerRef.current;
        setIsRecording(null);
        setTranscribedText(text);

        if (currentSpeaker) {
          await handleTranslate(text, currentSpeaker);
        }
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsRecording(null);
        activeSpeakerRef.current = null;
      };

      recognition.onend = () => {
        setIsRecording(null);
        activeSpeakerRef.current = null;
      };

      recognitionRef.current = recognition;
    }
  }, [langA, langB, tone, provider]);

  const toggleRecording = (side) => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported on this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording === side) {
      recognitionRef.current.stop();
      setIsRecording(null);
      activeSpeakerRef.current = null;
      return;
    }

    // Set both ref and state
    activeSpeakerRef.current = side;
    setIsRecording(side);
    setTranscribedText('');
    setTranslatedResult(null);

    // Speaker A speaks langA; Speaker B speaks langB
    const speechLangCode = side === 'A' ? langA : langB;
    recognitionRef.current.lang = BCP_MAP[speechLangCode] || 'en-US';

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("Recognition already active or interrupted:", err);
    }
  };

  const handleTranslate = async (text, speakerSide) => {
    setIsLoading(true);

    // CRITICAL: If Speaker A talks, source is langA and target is langB
    // If Speaker B talks, source is langB and target is langA
    const src = speakerSide === 'A' ? langA : langB;
    const tgt = speakerSide === 'A' ? langB : langA;

    console.log(`[Translate Request] Side: ${speakerSide} | ${src} -> ${tgt} | Text: "${text}"`);

    try {
      const res = await fetch('http://localhost:8000/speech-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_text: text,
          source_language: src,
          target_language: tgt,
          tone: tone,
          provider: provider
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Translation request failed');
      }

      const data = await res.json();
      setTranslatedResult(data);
      playSpeech(data.translated_text, tgt);
    } catch (err) {
      console.error(err);
      alert('Error translating speech: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const playSpeech = (text, langCode) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BCP_MAP[langCode] || 'en-US';
    utterance.rate = 0.92;

    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
    const match = voices.find(v =>
      v.lang && (v.lang.toLowerCase() === BCP_MAP[langCode]?.toLowerCase() || v.lang.toLowerCase().startsWith(langCode))
    );
    if (match) utterance.voice = match;

    window.speechSynthesis.speak(utterance);
  };

  const swapLanguages = () => {
    setLangA(langB);
    setLangB(langA);
    setTranscribedText('');
    setTranslatedResult(null);
  };

  return (
    <div className="w-full max-w-xl bg-[#111b21] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎙️</span>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Bidirectional Voice Coach</h3>
            <p className="text-[10px] text-slate-400">Pragmatic speech-to-speech engine</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tone Selection */}
      <div className="mb-4 bg-[#182229] p-2 rounded-xl border border-slate-700/60">
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
          Target Tone
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['polite', 'traditional', 'casual'].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                tone === t
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-[#202c33] text-slate-300 hover:bg-[#2a3942]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Languages Selection & Swap */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mb-5 bg-[#182229] p-3 rounded-xl border border-slate-700/60">
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Speaker 1 (Side A)</label>
          <select
            value={langA}
            onChange={(e) => setLangA(e.target.value)}
            className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-xs font-semibold text-emerald-400 focus:outline-none"
          >
            {LANG_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
          </select>
        </div>

        <button
          onClick={swapLanguages}
          className="mt-3 p-2 rounded-full bg-[#202c33] hover:bg-slate-700 text-slate-300 transition-colors"
          title="Swap Languages"
        >
          ⇄
        </button>

        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Speaker 2 (Side B)</label>
          <select
            value={langB}
            onChange={(e) => setLangB(e.target.value)}
            className="w-full bg-[#202c33] border border-slate-700 rounded-lg p-2 text-xs font-semibold text-sky-400 focus:outline-none"
          >
            {LANG_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* Mic Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => toggleRecording('A')}
          disabled={isLoading}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
            isRecording === 'A'
              ? 'bg-red-500/20 border-red-500 text-red-300 ring-2 ring-red-500/50'
              : 'bg-[#182229] hover:bg-[#202c33] border-emerald-500/30 text-slate-200'
          }`}
        >
          <span className="text-2xl mb-1">{isRecording === 'A' ? '🛑' : '🎙️'}</span>
          <span className="text-xs font-bold text-emerald-400">
            Speak {LANG_OPTIONS.find(l => l.code === langA)?.label.split(' ')[0]}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {isRecording === 'A' ? 'Listening...' : `Translates to ${LANG_OPTIONS.find(l => l.code === langB)?.label.split(' ')[0]}`}
          </span>
        </button>

        <button
          onClick={() => toggleRecording('B')}
          disabled={isLoading}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
            isRecording === 'B'
              ? 'bg-red-500/20 border-red-500 text-red-300 ring-2 ring-red-500/50'
              : 'bg-[#182229] hover:bg-[#202c33] border-sky-500/30 text-slate-200'
          }`}
        >
          <span className="text-2xl mb-1">{isRecording === 'B' ? '🛑' : '🎙️'}</span>
          <span className="text-xs font-bold text-sky-400">
            Speak {LANG_OPTIONS.find(l => l.code === langB)?.label.split(' ')[0]}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {isRecording === 'B' ? 'Listening...' : `Translates to ${LANG_OPTIONS.find(l => l.code === langA)?.label.split(' ')[0]}`}
          </span>
        </button>
      </div>

      {/* Transcription Banner */}
      {transcribedText && (
        <div className="bg-[#182229] p-3 rounded-lg mb-3 border border-slate-700/50">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Detected Speech</p>
          <p className="text-sm text-slate-100 italic">"{transcribedText}"</p>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="text-center py-3 text-xs text-slate-400 flex items-center justify-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          Applying {tone} pragmatic calibration...
        </div>
      )}

      {/* Result Card */}
      {translatedResult && (
        <div className="bg-[#182229] p-4 rounded-xl border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              {translatedResult.selected_tone} Output ({translatedResult.target_language.toUpperCase()})
            </span>
            <div className="flex items-center gap-2">
              {onInsertToChat && (
                <button
                  onClick={() => onInsertToChat(translatedResult.translated_text)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded font-medium"
                >
                  Insert to Chat
                </button>
              )}
              <button
                onClick={() => playSpeech(translatedResult.translated_text, translatedResult.target_language)}
                className="text-xs bg-[#202c33] hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"
              >
                🔊 Replay
              </button>
            </div>
          </div>

          <p className="text-base font-semibold text-slate-100 leading-relaxed">
            {translatedResult.translated_text}
          </p>

          <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400 gap-2">
            <span className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
              {translatedResult.t_v_pronoun_used}
            </span>
            <span className="text-[10px] text-slate-500">{translatedResult.model_used}</span>
          </div>
          <p className="text-xs text-slate-400 italic bg-[#111b21] p-2 rounded border border-slate-800">
            💡 {translatedResult.cultural_notes}
          </p>
        </div>
      )}
    </div>
  );
}
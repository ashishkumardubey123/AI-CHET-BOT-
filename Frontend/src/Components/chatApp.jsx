import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function SimpleTextChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sanitizeText = (value) =>
    String(value ?? '')
      .replace(/[^\p{L}\p{N}\s.,!?()'"-]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const loadVoices = () =>
    new Promise((resolve) => {
      let voices = speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          voices = speechSynthesis.getVoices();
          resolve(voices);
        };
      }
    });

  const pickMaleVoice = (voices) => {
    const malePattern = /(male|man|david|rahul|aditya|amit|rohan|karun|hitesh|shubh)/i;
    return (
      voices.find((v) => v.lang === 'hi-IN' && malePattern.test(v.name)) ||
      voices.find((v) => v.lang.startsWith('en') && malePattern.test(v.name)) ||
      voices.find((v) => v.lang === 'hi-IN') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null
    );
  };

  const stopAudio = () => {
    if (window?.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSpeechId(null);
    setMessages((prev) => prev.map((m) => ({ ...m, audioLoading: false })));
  };

  const handlePlayAudio = async (messageId, text) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, audioLoading: true, audioError: null } : m
      )
    );

    try {
      if (!window.speechSynthesis) {
        throw new Error('Web Speech API not supported in this browser.');
      }

      const cleanedText = sanitizeText(text);
      if (!cleanedText) {
        throw new Error('Readable text not available for audio.');
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const voices = await loadVoices();
      const selectedVoice = pickMaleVoice(voices);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'hi-IN';
      }

      utterance.rate = 0.95;
      utterance.pitch = 0.85;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setActiveSpeechId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveSpeechId(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, audioLoading: false } : m
          )
        );
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveSpeechId(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  audioLoading: false,
                  audioError: 'Voice playback failed. Text available.',
                }
              : m
          )
        );
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      setIsSpeaking(false);
      setActiveSpeechId(null);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                audioLoading: false,
                audioError: error.message,
              }
            : m
        )
      );
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const currentInput = sanitizeText(input);
    const userMsg = { id: Date.now(), role: 'user', content: currentInput };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:3000/generate-text', {
        message: currentInput,
      });

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: sanitizeText(data?.text || 'Text response mila, lekin format issue tha.'),
        audioLoading: false,
        audioError: null,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Error: Server se text response nahi mila.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text) => {
    return <span className="whitespace-pre-wrap leading-relaxed">{text}</span>;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans selection:bg-zinc-700 selection:text-white">
      <div className="w-full max-w-4xl bg-[#0a0a0a] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-zinc-800/80">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/80 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 leading-tight">Ashish's AI</h1>
            <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              System Online
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50">
                <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
              </svg>
              <p className="text-sm font-medium tracking-wide">Initiate conversation or drop some code...</p>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 border
                  ${m.role === 'user' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-white text-black'}`}
                >
                  {m.role === 'user' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect></svg>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-w-0">
                  <div className={`px-5 py-3.5 rounded-2xl text-sm md:text-base tracking-wide
                    ${m.role === 'user' 
                      ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm shadow-md' 
                      : 'bg-transparent text-zinc-300'
                    }`}
                  >
                    {renderMessageContent(m.content)}
                  </div>

                  {m.role === 'assistant' && (
                    <div className="flex items-start">
                      <button
                        onClick={() => handlePlayAudio(m.id, m.content)}
                        disabled={m.audioLoading}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300
                          ${m.audioLoading ? 'bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 shadow-sm'}`}
                      >
                        {m.audioLoading ? (
                          <svg className="animate-spin h-3.5 w-3.5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        )}
                        {m.audioLoading ? 'Speaking...' : 'Listen'}
                      </button>
                      <button
                        type="button"
                        onClick={stopAudio}
                        disabled={!isSpeaking || activeSpeechId !== m.id}
                        className={`ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300
                          ${isSpeaking && activeSpeechId === m.id ? 'bg-red-900/30 text-red-300 border-red-700 hover:bg-red-800/40' : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
                      >
                        Stop Audio
                      </button>
                      {m.audioError && <span className="ml-3 mt-1.5 text-xs text-red-400/80">{m.audioError}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 border border-white mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect></svg>
              </div>
              <div className="bg-transparent px-2 py-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[#0a0a0a] border-t border-zinc-800/80">
          <form onSubmit={handleSend} className="relative flex items-center max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message to Ashish's AI..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:bg-zinc-900 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-2xl px-5 py-4 pr-16 text-sm md:text-base text-zinc-100 placeholder-zinc-500 outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`absolute right-2 p-2.5 rounded-xl flex items-center justify-center transition-all duration-200
                ${input.trim() && !loading ? 'bg-white text-black hover:bg-zinc-200 shadow-lg scale-100' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed scale-95'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <div className="text-center mt-3 mb-1">
            <span className="text-[11px] text-zinc-600 tracking-wide font-medium">AI generated content may be inaccurate.</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}} />
    </div>
  );
}

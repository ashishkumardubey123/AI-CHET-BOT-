import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { LANG, UI_TEXT } from "../constants";
import { 
  createMessageId, 
  sanitizeInputText, 
  sanitizeOutputText, 
  detectLanguage, 
  pickVoice 
} from "../utils";
import { Header } from "./Header";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageItem } from "./MessageItem";
import { ChatInput } from "./ChatInput";

export default function ChatApp() {
  interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    language?: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [micLanguage, setMicLanguage] = useState(LANG.EN);
  const [uiLanguage, setUiLanguage] = useState(LANG.EN);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const uiText = useMemo(() => UI_TEXT[uiLanguage as keyof typeof UI_TEXT] || UI_TEXT[LANG.EN], [uiLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;
    const syncVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    syncVoices();
    window.speechSynthesis.onvoiceschanged = syncVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleMicLanguage = () => {
    setMicLanguage((prev) => {
      const next = prev === LANG.HI ? LANG.EN : LANG.HI;
      setUiLanguage(next);
      return next;
    });
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(uiText.unsupportedVoice);
      return;
    }
    recognitionRef.current?.stop();
    const recognition = new SpeechRecognition();
    recognition.lang = micLanguage;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      const filtered = sanitizeInputText(transcript);
      const lang = detectLanguage(filtered);
      setInput(filtered);
      setUiLanguage(lang);
      setMicLanguage(lang);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handlePlayAudio = (messageId: string, text: string, messageLanguage?: string) => {
    if (!window.speechSynthesis) return;
    const cleanText = sanitizeOutputText(text);
    if (!cleanText) return;
    window.speechSynthesis.cancel();
    const speechLanguage = detectLanguage(cleanText) || messageLanguage || LANG.EN;
    const selectedVoice = pickVoice(availableVoices, speechLanguage);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang || speechLanguage;
    utterance.onstart = () => { setIsSpeaking(true); setActiveSpeechId(messageId); };
    utterance.onend = () => { setIsSpeaking(false); setActiveSpeechId(null); };
    utterance.onerror = () => { setIsSpeaking(false); setActiveSpeechId(null); };
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (loading || !input.trim()) return;
    const cleanInput = sanitizeInputText(input);
    const lang = detectLanguage(cleanInput);
    const userMsg: Message = { id: createMessageId(), role: "user", content: cleanInput, language: lang };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await axios.post("https://ai-chet-bot.onrender.com/generate", {
        message: userMsg.content,
        language: lang,
      });
      const reply = sanitizeOutputText(data?.text || data?.reply) || UI_TEXT[lang as keyof typeof UI_TEXT].fallback;
      setMessages(prev => [...prev, { id: createMessageId(), role: "assistant", content: reply, language: detectLanguage(reply) }]);
    } catch {
      setMessages(prev => [...prev, { id: createMessageId(), role: "assistant", content: UI_TEXT[lang as keyof typeof UI_TEXT].serverError, language: lang }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <Header 
        title={uiText.appTitle} 
        subTitle={uiText.appSubTitle} 
        micLanguage={micLanguage} 
      />

      <main className="relative flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {messages.length === 0 ? (
            <WelcomeScreen 
              appTitle={uiText.appTitle} 
              onSuggestionClick={(text) => {
                setInput(text);
                setUiLanguage(detectLanguage(text));
              }} 
            />
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isSpeaking={isSpeaking}
                    activeSpeechId={activeSpeechId}
                    onPlayAudio={handlePlayAudio}
                    onStopAudio={() => window.speechSynthesis.cancel()}
                    uiLanguage={uiLanguage}
                  />
                ))}
              </AnimatePresence>
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 border border-white/5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                          className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-400">{uiText.thinking}</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      <ChatInput
        input={input}
        setInput={setInput}
        loading={loading}
        isListening={isListening}
        onSend={handleSend}
        onMicToggle={isListening ? stopListening : startListening}
        onLangToggle={toggleMicLanguage}
        micLanguage={micLanguage}
        uiLanguage={uiLanguage}
        placeholder={isListening ? uiText.placeholderListening : uiText.placeholderTyping}
      />
    </div>
  );
}

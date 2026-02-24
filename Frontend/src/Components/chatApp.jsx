import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

const LANG = {
  EN: "en-IN",
  HI: "hi-IN",
};

const UI_TEXT = {
  [LANG.EN]: {
    appTitle: "Ashish AI",
    appSubTitle: "Voice-first smart assistant",
    greeting: "Hello! Ask anything. I can answer in English or Hindi.",
    placeholderTyping: "Type your message...",
    placeholderListening: "Listening... speak now",
    thinking: "Thinking...",
    listen: "Listen",
    stop: "Stop",
    micOn: "Stop Mic",
    micOff: "Voice",
    unsupportedVoice: "Your browser does not support voice input. Use Chrome.",
    fallback: "Sorry, I could not generate a response.",
    serverError: "Server error. Please check backend connection.",
    languageToggle: "Lang",
  },
  [LANG.HI]: {
    appTitle: "Ashish AI",
    appSubTitle: "Voice-first smart assistant",
    greeting:
      "\u0928\u092e\u0938\u094d\u0924\u0947! \u0906\u092a \u0915\u0941\u091b \u092d\u0940 \u092a\u0942\u091b \u0938\u0915\u0924\u0947 \u0939\u0948\u0902. \u092e\u0948\u0902 Hindi \u092f\u093e English \u092e\u0947\u0902 \u091c\u0935\u093e\u092c \u0926\u0942\u0901\u0917\u093e.",
    placeholderTyping: "\u0905\u092a\u0928\u093e \u0938\u0935\u093e\u0932 \u0932\u093f\u0916\u0947\u0902...",
    placeholderListening: "\u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0942\u0901... \u0905\u092c \u092c\u094b\u0932\u093f\u090f",
    thinking: "\u0938\u094b\u091a \u0930\u0939\u093e \u0939\u0942\u0901...",
    listen: "\u0938\u0941\u0928\u0947\u0902",
    stop: "\u0930\u094b\u0915\u0947\u0902",
    micOn: "Mic \u092c\u0902\u0926",
    micOff: "Voice",
    unsupportedVoice:
      "\u0906\u092a\u0915\u093e browser voice input support \u0928\u0939\u0940\u0902 \u0915\u0930\u0924\u093e. \u0915\u0943\u092a\u092f\u093e Chrome use \u0915\u0930\u0947\u0902.",
    fallback: "\u0915\u094d\u0937\u092e\u093e \u0915\u0930\u0947\u0902, \u091c\u0935\u093e\u092c \u0924\u0948\u092f\u093e\u0930 \u0928\u0939\u0940\u0902 \u0939\u094b \u092a\u093e\u092f\u093e.",
    serverError: "Server error. Backend connection check \u0915\u0930\u0947\u0902.",
    languageToggle: "\u092d\u093e\u0937\u093e",
  },
};

const INPUT_ALLOWED_REGEX = /[^\p{Script=Devanagari}A-Za-z0-9\s.,!?;:'"()-]/gu;
const OUTPUT_ALLOWED_REGEX = /[^\p{Script=Devanagari}A-Za-z0-9\s.,!?;:'"()*:\n.\u2022\u0964-]/gu;
const ROMAN_HINDI_HINT_REGEX =
  /\b(kya|kaise|kyu|kyon|namaste|dhanyavad|aap|mujhe|mera|meri|hai|nahi|haan|kripya|samjhao|batayo|batao|iska|isme)\b/i;

const createMessageId = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const sanitizeInputText = (raw) =>
  String(raw || "")
    .replace(INPUT_ALLOWED_REGEX, " ")
    .replace(/([!?.,])\1+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

const sanitizeOutputText = (raw) =>
  String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(OUTPUT_ALLOWED_REGEX, " ")
    .split("\n")
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();

const detectLanguage = (text) => {
  const content = String(text || "").trim();
  if (!content) return LANG.EN;
  if (/[\u0900-\u097F]/.test(content)) return LANG.HI;
  if (ROMAN_HINDI_HINT_REGEX.test(content)) return LANG.HI;
  return LANG.EN;
};

const splitTextIntoPointItems = (text) => {
  const normalizedText = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedText) return [];

  const sentenceMatches = normalizedText.match(/[^.!?\u0964]+[.!?\u0964]?/g) || [normalizedText];
  return sentenceMatches
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseMessageBlocks = (content, options = {}) => {
  const { forcePoints = false } = options;
  const lines = String(content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [{ type: "text", text: "" }];

  if (forcePoints) {
    const items = lines.flatMap((line) => {
      const listMatch = line.match(/^(?:[-*\u2022]\s+|\d+[.)]\s+)(.+)$/);
      if (listMatch) return [listMatch[1].trim()];
      return splitTextIntoPointItems(line);
    });

    if (items.length) return [{ type: "list", items }];
    return [{ type: "text", text: lines.join(" ") }];
  }

  const blocks = [];
  let listItems = [];
  let textLines = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: [...listItems] });
      listItems = [];
    }
  };

  const flushText = () => {
    if (textLines.length) {
      blocks.push({ type: "text", text: textLines.join(" ") });
      textLines = [];
    }
  };

  for (const line of lines) {
    const listMatch = line.match(/^(?:[-*\u2022]\s+|\d+[.)]\s+)(.+)$/);
    if (listMatch) {
      flushText();
      listItems.push(listMatch[1].trim());
      continue;
    }

    flushList();
    textLines.push(line);
  }

  flushText();
  flushList();

  return blocks;
};

const pickVoice = (voices, preferredLang) => {
  if (!voices.length) return null;

  const langPrefix = preferredLang === LANG.HI ? "hi" : "en";
  const premiumPattern = /(google|natural|microsoft|neural|premium|zira|heera|rahul|aditya|amit|rohan)/i;

  return (
    voices.find(
      (voice) =>
        voice.lang?.toLowerCase().startsWith(langPrefix) && premiumPattern.test(voice.name)
    ) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith(langPrefix)) ||
    (preferredLang === LANG.HI &&
      (voices.find((voice) => voice.lang?.toLowerCase().startsWith("en-in")) ||
        voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")))) ||
    voices.find((voice) => premiumPattern.test(voice.name)) ||
    voices[0]
  );
};

const messageAnimation = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionButton = motion.button;
const MotionSpan = motion.span;

export default function RefinedChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const [micLanguage, setMicLanguage] = useState(LANG.EN);
  const [uiLanguage, setUiLanguage] = useState(LANG.EN);
  const [availableVoices, setAvailableVoices] = useState([]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const uiText = useMemo(() => UI_TEXT[uiLanguage] || UI_TEXT[LANG.EN], [uiLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;

    const syncVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices || []);
    };

    syncVoices();

    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener("voiceschanged", syncVoices);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
    }

    window.speechSynthesis.onvoiceschanged = syncVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      try {
        recognitionRef.current?.stop();
      } catch {
        // no-op
      }
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(uiText.unsupportedVoice);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // no-op
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = micLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      const filteredTranscript = sanitizeInputText(transcript);
      const transcriptLanguage = detectLanguage(filteredTranscript);

      setInput(filteredTranscript);
      setUiLanguage(transcriptLanguage);
      setMicLanguage(transcriptLanguage);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // no-op
    }
    setIsListening(false);
    recognitionRef.current = null;
  };

  const stopAudio = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setActiveSpeechId(null);
  };

  const handlePlayAudio = (messageId, text, messageLanguage) => {
    if (!window.speechSynthesis) return;

    const cleanText = sanitizeOutputText(text);
    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const speechLanguage = detectLanguage(cleanText) || messageLanguage || LANG.EN;
    const voices = availableVoices.length ? availableVoices : window.speechSynthesis.getVoices();
    const selectedVoice = pickVoice(voices, speechLanguage);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = selectedVoice || null;
    utterance.lang = selectedVoice?.lang || speechLanguage;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveSpeechId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const onChangeInput = (event) => {
    const typedValue = event.target.value;
    setInput(typedValue);

    if (typedValue.trim()) {
      const typedLanguage = detectLanguage(typedValue);
      setUiLanguage(typedLanguage);
      setMicLanguage(typedLanguage);
    }
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    if (loading) return;

    const cleanInput = sanitizeInputText(input);
    if (!cleanInput) return;

    const messageLanguage = detectLanguage(cleanInput);
    setUiLanguage(messageLanguage);
    setMicLanguage(messageLanguage);

    const userMessage = {
      id: createMessageId(),
      role: "user",
      content: cleanInput,
      language: messageLanguage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("https://ai-chet-bot.onrender.com/generate", {
        message: userMessage.content,
        language: messageLanguage,
      });

      const rawReply = data?.text || data?.reply || UI_TEXT[messageLanguage].fallback;
      const filteredReply = sanitizeOutputText(rawReply) || UI_TEXT[messageLanguage].fallback;
      const replyLanguage = detectLanguage(filteredReply) || messageLanguage;

      const assistantMessage = {
        id: createMessageId(),
        role: "assistant",
        content: filteredReply,
        language: replyLanguage,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content: UI_TEXT[messageLanguage].serverError,
          language: messageLanguage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-950 px-2 py-2 sm:px-4 sm:py-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <MotionSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex h-full max-h-[900px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        <header className="border-b border-white/10 bg-slate-900/60 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                {uiText.appTitle}
              </h1>
              <p className="truncate text-[11px] text-slate-300 sm:text-xs">{uiText.appSubTitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                Live
              </span>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                {micLanguage === LANG.HI ? "HI" : "EN"}
              </span>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
          {messages.length === 0 && (
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 flex flex-col items-center justify-center space-y-8 text-center sm:mt-14"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(34,211,238,0.4)",
                    "0 0 50px rgba(34,211,238,0.8)",
                    "0 0 0px rgba(34,211,238,0.4)",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-3xl font-bold text-slate-900 shadow-xl"
              >
                AI
              </motion.div>

              <h2 className="bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                Welcome to {uiText.appTitle}
              </h2>

              <p className="max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
                Your intelligent voice-first assistant. Ask anything in English or Hindi, switch
                languages instantly, and experience smooth AI conversation.
              </p>

              <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  "Explain JWT in simple words",
                  "Best SEO tips for 2026",
                  "Node.js project ideas",
                  "How to improve UI animations?",
                ].map((text, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setInput(text);
                      setUiLanguage(detectLanguage(text));
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    {text}
                  </motion.button>
                ))}
              </div>
            </MotionDiv>
          )}

          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {messages.map((message) => {
                const isUser = message.role === "user";
                const blocks = parseMessageBlocks(message.content, { forcePoints: !isUser });

                return (
                  <MotionArticle
                    key={message.id}
                    layout
                    variants={messageAnimation}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl border px-4 py-3 text-sm shadow-lg sm:max-w-[80%] sm:text-[15px] ${
                        isUser
                          ? "border-cyan-200/30 bg-gradient-to-br from-cyan-200 to-sky-300 text-slate-900"
                          : "border-white/10 bg-slate-900/70 text-slate-100"
                      }`}
                    >
                      <div className={`space-y-2 break-words ${isUser ? "leading-relaxed" : "leading-7"}`}>
                        {blocks.map((block, blockIndex) => {
                          if (block.type === "list") {
                            return (
                              <ul
                                key={`${message.id}-list-${blockIndex}`}
                                className={`list-disc pl-5 ${
                                  isUser ? "space-y-1 marker:text-slate-700" : "space-y-2 marker:text-cyan-300"
                                }`}
                              >
                                {block.items.map((item, itemIndex) => (
                                  <li key={`${message.id}-item-${itemIndex}`}>{item}</li>
                                ))}
                              </ul>
                            );
                          }

                          return (
                            <p key={`${message.id}-text-${blockIndex}`} className="whitespace-pre-wrap">
                              {block.text}
                            </p>
                          );
                        })}
                      </div>

                      {!isUser && (
                        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2">
                          <MotionButton
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePlayAudio(message.id, message.content, message.language)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:bg-white/10"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            {UI_TEXT[message.language || uiLanguage].listen}
                          </MotionButton>

                          {isSpeaking && activeSpeechId === message.id && (
                            <MotionButton
                              whileTap={{ scale: 0.97 }}
                              onClick={stopAudio}
                              className="rounded-lg border border-rose-300/30 bg-rose-300/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-200"
                            >
                              {UI_TEXT[message.language || uiLanguage].stop}
                            </MotionButton>
                          )}
                        </div>
                      )}
                    </div>
                  </MotionArticle>
                );
              })}

              {loading && (
                <MotionDiv
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-200">
                    <span>{uiText.thinking}</span>
                    <MotionSpan animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.1 }}>
                      .
                    </MotionSpan>
                    <MotionSpan animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.15 }}>
                      .
                    </MotionSpan>
                    <MotionSpan animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.3 }}>
                      .
                    </MotionSpan>
                  </div>
                </MotionDiv>
              )}
            </div>
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </main>

        <footer className="border-t border-white/10 bg-slate-900/70 p-3 sm:p-4">
          <form onSubmit={handleSend} className="mx-auto flex w-full items-end gap-2 sm:gap-3">
            <MotionButton
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              className={`h-11 shrink-0 rounded-xl border px-3 text-xs font-semibold transition sm:h-12 sm:px-4 ${
                isListening
                  ? "border-rose-300/40 bg-rose-300/15 text-rose-100"
                  : "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
              }`}
            >
              {isListening ? uiText.micOn : uiText.micOff}
            </MotionButton>

            <MotionButton
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={toggleMicLanguage}
              className="h-11 shrink-0 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20 sm:h-12 sm:px-4"
            >
              {uiText.languageToggle}: {micLanguage === LANG.HI ? "HI" : "EN"}
            </MotionButton>

            <div className="flex-1">
              <input
                type="text"
                value={input}
                onChange={onChangeInput}
                placeholder={isListening ? uiText.placeholderListening : uiText.placeholderTyping}
                className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 sm:h-12 sm:px-4"
                autoComplete="off"
              />
            </div>

            <MotionButton
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={loading || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-slate-900 shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
              aria-label="Send message"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </MotionButton>
          </form>
        </footer>
      </MotionSection>
    </div>
  );
}

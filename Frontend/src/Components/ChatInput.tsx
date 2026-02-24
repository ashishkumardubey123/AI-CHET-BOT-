import React from "react";
import { motion } from "framer-motion";
import { UI_TEXT } from "../constants";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  isListening: boolean;
  onSend: (e: React.FormEvent) => void;
  onMicToggle: () => void;
  onLangToggle: () => void;
  micLanguage: string;
  uiLanguage: string;
  placeholder: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  loading,
  isListening,
  onSend,
  onMicToggle,
  onLangToggle,
  micLanguage,
  uiLanguage,
  placeholder,
}) => {
  const ui = UI_TEXT[uiLanguage as keyof typeof UI_TEXT] || UI_TEXT["en-IN"];

  return (
    <footer className="border-t border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
      <form onSubmit={onSend} className="mx-auto flex max-w-4xl items-center gap-2 sm:gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMicToggle}
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ${
            isListening
              ? "border-rose-500/50 bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
          }`}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="6" height="6" />
              </svg>
            </motion.div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLangToggle}
          className="flex h-12 shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-bold uppercase tracking-widest text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
        >
          <span className="opacity-50 text-[10px]">{ui.languageToggle}</span>
          {micLanguage === "hi-IN" ? "HI" : "EN"}
        </motion.button>

        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 disabled:opacity-50"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent"
              />
            </div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading || !input.trim()}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6,182,212,0.4)" }}
          whileTap={{ scale: 0.95 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg transition-all disabled:opacity-50 disabled:grayscale"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </motion.button>
      </form>
    </footer>
  );
};

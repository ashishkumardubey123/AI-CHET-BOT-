import React from "react";
import { motion } from "framer-motion";
import { UI_TEXT } from "../constants";

interface WelcomeScreenProps {
  appTitle: string;
  onSuggestionClick: (text: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ appTitle, onSuggestionClick }) => {
  const suggestions = [
    "Explain Quantum Computing simply",
    "Best travel spots in India",
    "How to learn React in 2026?",
    "Write a poem about the moon",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 p-1 shadow-2xl shadow-cyan-500/20"
      >
        <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-slate-950 text-4xl font-black text-white">
          AI
        </div>
      </motion.div>

      <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
        Meet <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">{appTitle}</span>
      </h2>

      <p className="mb-12 max-w-md text-slate-400 leading-relaxed">
        Your intelligent multilingual companion. Speak or type in Hindi or English for instant, smart responses.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((text, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(text)}
            className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-left text-sm font-medium text-slate-300 backdrop-blur-sm transition-all hover:border-cyan-500/30"
          >
            {text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

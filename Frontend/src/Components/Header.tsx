import React from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  subTitle: string;
  micLanguage: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subTitle, micLanguage }) => {
  return (
    <header className="border-b border-white/10 bg-slate-900/40 px-4 py-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="truncate text-lg font-bold tracking-tight text-white sm:text-xl"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="truncate text-xs text-slate-400"
          >
            {subTitle}
          </motion.p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              {micLanguage === "hi-IN" ? "Hindi" : "English"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from "react";
import { motion } from "framer-motion";
import { parseMessageBlocks } from "../utils";
import { UI_TEXT } from "../constants";

interface MessageItemProps {
  message: {
    id: string;
    role: string;
    content: string;
    language?: string;
  };
  isSpeaking: boolean;
  activeSpeechId: string | null;
  onPlayAudio: (id: string, content: string, lang?: string) => void;
  onStopAudio: () => void;
  uiLanguage: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isSpeaking,
  activeSpeechId,
  onPlayAudio,
  onStopAudio,
  uiLanguage,
}) => {
  const isUser = message.role === "user";
  const blocks = parseMessageBlocks(message.content, { forcePoints: !isUser });
  const msgLang = message.language || uiLanguage;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative group max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-xl transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-none border border-white/20"
            : "bg-white/10 backdrop-blur-md text-slate-100 rounded-tl-none border border-white/10"
        }`}
      >
        <div className="space-y-2 break-words leading-relaxed">
          {blocks.map((block, i) => {
            if (block.type === "list") {
              return (
                <ul key={i} className="list-disc pl-5 space-y-1.5 marker:text-cyan-400">
                  {block.items.map((item: string, j: number) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i} className="whitespace-pre-wrap">{block.text}</p>;
          })}
        </div>

        {!isUser && (
          <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-2">
            <button
              onClick={() => onPlayAudio(message.id, message.content, message.language)}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:bg-white/10 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              {UI_TEXT[msgLang as keyof typeof UI_TEXT]?.listen || "Listen"}
            </button>

            <button
              onClick={onStopAudio}
              disabled={!isSpeaking || activeSpeechId !== message.id}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 transition-colors hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-rose-500/20"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isSpeaking && activeSpeechId === message.id ? "animate-pulse bg-rose-400" : "bg-rose-400/60"
                }`}
              />
              {UI_TEXT[msgLang as keyof typeof UI_TEXT]?.stop || "Stop"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

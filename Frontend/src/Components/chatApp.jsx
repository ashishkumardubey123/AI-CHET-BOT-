import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/generate', {
        message: input 
      });

      const aiText = response.data.text; 
      setMessages((prev) => [...prev, { role: 'assistant', content: aiText }]);
      
    } catch (error) {
      console.error('API Error:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Server Error. Please check your connection.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-3 md:p-6 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Chat Container */}
      <div className="w-full max-w-5xl h-[92vh] relative z-10">
        <div className="h-full bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <header className="relative bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* AI Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                </div>
                
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    AI Code Assistant
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs md:text-sm text-emerald-400 font-medium">Active Now</span>
                    </div>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">Designed and developed by ASHISH </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="text-lg font-bold text-white">{messages.filter(m => m.role === 'user').length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Messages</div>
                </div>
              </div>
            </div>
          </header>

          {/* Messages Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-900 animate-bounce">
                    ✨
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Start Your Coding Journey
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base max-w-md">
                    Ask me anything about Node.js, React, MongoDB, Express, or any coding challenge you're facing.
                  </p>
                </div>

                {/* Quick Suggestions */}
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                  {[
                    { icon: '🐛', text: 'Debug my code', color: 'from-red-500/20 to-orange-500/20 border-red-500/30' },
                    { icon: '⚡', text: 'Optimize performance', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30' },
                    { icon: '🏗️', text: 'Design architecture', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
                    { icon: '💡', text: 'Best practices', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' }
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion.text)}
                      className={`px-4 py-2 bg-gradient-to-r ${suggestion.color} border rounded-full text-xs md:text-sm text-slate-200 hover:scale-105 transition-all duration-300 hover:shadow-lg backdrop-blur-sm`}
                    >
                      <span className="mr-1.5">{suggestion.icon}</span>
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slideIn`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30'
                      : 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-purple-500/30'
                  }`}>
                    {msg.role === 'user' ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-600">Just now</span>
                    </div>
                    
                    <div className={`p-4 md:p-5 rounded-2xl shadow-xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-sm shadow-blue-500/20'
                        : 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 text-slate-100 rounded-bl-sm shadow-slate-900/50'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-pre:bg-slate-950/50 prose-pre:border prose-pre:border-slate-700 prose-code:text-cyan-400 prose-headings:text-slate-100 prose-p:text-slate-200 prose-strong:text-white prose-a:text-blue-400">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-4 animate-slideIn">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl rounded-bl-sm p-5 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-sm text-slate-400 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </main>

          {/* Input Area */}
          <footer className="bg-slate-800/60 backdrop-blur-xl border-t border-slate-700/50 p-4 md:p-6">
            <form onSubmit={sendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="w-full bg-slate-900/50 text-slate-100 placeholder-slate-500 rounded-2xl px-5 md:px-6 py-3.5 md:py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-slate-700/50 transition-all duration-300 disabled:opacity-50 text-sm md:text-base backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs hidden md:flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px]">Enter</kbd>
                  <span>to send</span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="relative group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden md:inline">Send</span>
                </span>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Footer Info */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] md:text-xs text-slate-600">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>AI can make mistakes. Check important info.</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
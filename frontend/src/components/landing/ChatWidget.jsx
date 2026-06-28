import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Bot } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STARTER_PROMPTS = [
  "How can STUDLYF AI help my startup?",
  "What's included in the Pro plan?",
  "Generate a quick pitch idea",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm STUDLYF AI. Ask me anything about features, pricing or how to launch your startup faster. ✨" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `web-${Math.random().toString(36).slice(2, 10)}`);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { message: msg, session_id: sessionId });
      setMessages((m) => [...m, { role: "assistant", text: res.data.reply || "..." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I hit a snag. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full glow-button flex items-center justify-center shadow-2xl"
        data-testid="chat-toggle"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="m" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <MessageSquare className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2ECC71] ring-2 ring-white animate-pulse" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[400px] h-[560px] max-h-[80vh] glass rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-white/70"
            data-testid="chat-panel"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold leading-none">STUDLYF AI</p>
                  <p className="text-[11px] opacity-90 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" /> Online • powered by Gemini
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white/40 no-scrollbar">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white rounded-br-sm"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1">
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94]" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} />
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-[#FF7A18]" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} />
                  </div>
                </div>
              )}
            </div>

            {/* Starter prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] transition text-gray-700"
                    data-testid={`chat-starter-${p.slice(0, 10)}`}
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />{p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-3 border-t border-white/60 bg-white/70 flex items-center gap-2"
              data-testid="chat-form"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 rounded-full bg-white border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 outline-none text-sm"
                data-testid="chat-input"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full glow-button flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="chat-send"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

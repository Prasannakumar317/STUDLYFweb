import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as Icons from "lucide-react";
import {
  Send, Paperclip, Mic, MicOff, Plus, MessageSquare, Sparkles, Bot, X,
  ChevronRight, Loader2, Copy, RotateCw, ThumbsUp, ThumbsDown, Trash2, Rocket,
  CheckCircle2, ArrowRight, Bell, Search, Menu,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { useProjects } from "../lib/projects";
import { toast } from "sonner";
import { Card, ScoreRing, COLORS } from "../components/workspace/visuals/Primitives";

/* ---------- Quick start cards ---------- */
const QUICK_STARTS = [
  { emoji: "✨", title: "Validate my startup", prompt: "I have a startup idea. Help me validate it step by step — market fit, problem severity, willingness to pay, risks.", gradient: "from-[#6C63FF] to-[#FF4D94]" },
  { emoji: "📈", title: "Build business plan", prompt: "Walk me through building a complete business plan — vision, model, market, GTM, financials.", gradient: "from-[#3B82F6] to-[#6C63FF]" },
  { emoji: "🎯", title: "Go-to-market strategy", prompt: "Help me design a go-to-market strategy: ICP, segments, channels, messaging, funnel.", gradient: "from-[#FF4D94] to-[#FF8A00]" },
  { emoji: "📊", title: "Market research", prompt: "Run a market research pass — TAM/SAM/SOM, trends, key players, opportunities.", gradient: "from-[#22C55E] to-[#3B82F6]" },
  { emoji: "💰", title: "Funding preparation", prompt: "Help me prepare for fundraising — what investors look for, materials needed, my readiness.", gradient: "from-[#FFC145] to-[#FF8A00]" },
  { emoji: "🚀", title: "MVP roadmap", prompt: "Help me scope an MVP and a 90-day build roadmap with milestones.", gradient: "from-[#6C63FF] to-[#22C55E]" },
  { emoji: "🎨", title: "Brand strategy", prompt: "Design a brand strategy — story, voice, positioning, taglines and palette.", gradient: "from-[#FF8A00] to-[#FF4D94]" },
  { emoji: "📢", title: "Marketing plan", prompt: "Draft a 1-page marketing plan with objectives, channels, KPIs and 90-day calendar.", gradient: "from-[#FF4D94] to-[#6C63FF]" },
  { emoji: "💡", title: "Startup ideas", prompt: "Generate 5 promising startup ideas for me based on current trends and unmet needs.", gradient: "from-[#3B82F6] to-[#22C55E]" },
  { emoji: "🧠", title: "AI business mentor", prompt: "Be my business mentor — ask me 3 sharp questions to diagnose where I am stuck.", gradient: "from-[#6C63FF] to-[#FF8A00]" },
];

const SUGGESTED_PROMPTS = [
  "Validate my startup", "SWOT analysis", "Competitor analysis",
  "Estimate TAM SAM SOM", "Customer persona", "Pricing strategy",
  "Financial forecast", "Investor pitch deck", "Sales strategy",
  "Brand identity", "SEO strategy", "Content calendar",
  "Growth strategy", "Roadmap", "Lean canvas",
];

/* ---------- Web Speech API ---------- */
function useSpeechToText(onResult) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const start = useCallback(() => {
    if (!supported) { toast.error("Voice input not supported in this browser"); return; }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new Rec();
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      onResult(t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recRef.current = r;
    setListening(true);
  }, [onResult, supported]);
  const stop = useCallback(() => { recRef.current?.stop?.(); setListening(false); }, []);
  return { start, stop, listening, supported };
}

/* ---------- Floating background ---------- */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at top, rgba(0,0,0,0.6), transparent 70%)",
        }} />
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity }}
        className="absolute -top-24 -left-12 w-[420px] h-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)", opacity: 0.35 }} />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-24 -right-16 w-[460px] h-[460px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #FF4D94 0%, transparent 70%)", opacity: 0.3 }} />
      <motion.div animate={{ x: [0, 20, 0], y: [0, 20, 0] }} transition={{ duration: 22, repeat: Infinity }}
        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #FF8A00 0%, transparent 70%)", opacity: 0.25 }} />
    </div>
  );
}

/* ---------- AI Thinking states (cycles labels) ---------- */
const THINKING_STATES = [
  "Thinking…", "Analysing market…", "Checking competitors…",
  "Creating strategy…", "Estimating market size…", "Building roadmap…",
];
function ThinkingBubble() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % THINKING_STATES.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 flex items-center gap-2">
        <motion.span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} />
        <motion.span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94]" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} />
        <motion.span className="w-1.5 h-1.5 rounded-full bg-[#FF8A00]" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} />
        <AnimatePresence mode="wait">
          <motion.span key={idx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="ml-2 text-xs font-medium text-gray-600">{THINKING_STATES[idx]}</motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ============================== MAIN PAGE ============================== */
export default function WorkspaceHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshProjects, setCurrent } = useProjects();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]); // UI-only chips
  const [sideOpen, setSideOpen] = useState(false);
  const [orbOpen, setOrbOpen] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapStep, setBootstrapStep] = useState("");
  const [bootstrapDone, setBootstrapDone] = useState(null); // project doc
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  /* --- conversations load + first-time create --- */
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/workspace/conversations");
        setConversations(r.data);
        if (r.data.length > 0) {
          await loadConversation(r.data[0].conversation_id);
        }
      } catch (e) { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversation = async (cid) => {
    setActiveId(cid);
    try {
      const r = await api.get(`/workspace/conversations/${cid}`);
      setMessages(r.data.messages || []);
    } catch (e) { setMessages([]); }
  };

  const newConversation = async () => {
    const r = await api.post("/workspace/conversations", { title: "New chat" });
    setConversations((cs) => [r.data, ...cs]);
    setActiveId(r.data.conversation_id);
    setMessages([]);
    setBootstrapDone(null);
  };

  const renameConversation = async (cid, title) => {
    try {
      await api.patch(`/workspace/conversations/${cid}`, { title });
      setConversations((cs) => cs.map((c) => c.conversation_id === cid ? { ...c, title } : c));
    } catch (_) {}
  };

  const deleteConversation = async (cid) => {
    if (!window.confirm("Delete this conversation?")) return;
    await api.delete(`/workspace/conversations/${cid}`);
    setConversations((cs) => cs.filter((c) => c.conversation_id !== cid));
    if (activeId === cid) {
      setActiveId(null); setMessages([]);
    }
  };

  /* --- send message --- */
  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;

    // ensure we have a conversation
    let cid = activeId;
    if (!cid) {
      const r = await api.post("/workspace/conversations", { title: msg.slice(0, 48) });
      cid = r.data.conversation_id;
      setActiveId(cid);
      setConversations((cs) => [r.data, ...cs]);
    }

    setInput("");
    setAttachments([]);
    const ts = new Date().toISOString();
    setMessages((m) => [...m, { role: "user", text: msg, ts }]);
    setSending(true);
    try {
      const r = await api.post(`/workspace/conversations/${cid}/messages`, { text: msg });
      setMessages((m) => [...m, r.data.assistant_message]);
      // update title in list
      setConversations((cs) => cs.map((c) => c.conversation_id === cid ? { ...c, title: r.data.title, updated_at: r.data.assistant_message.ts } : c));
    } catch (e) {
      toast.error("AI didn't respond — try again.");
      setMessages((m) => [...m, { role: "assistant", text: "Sorry — I hit a snag. Try sending that again.", ts: new Date().toISOString() }]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); });
    }
  };

  // auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  /* --- voice --- */
  const { start: startVoice, stop: stopVoice, listening, supported: voiceSupported } = useSpeechToText((t) => setInput(t));

  /* --- attachments (UI-only) --- */
  const onPickFiles = (e) => {
    const fs = Array.from(e.target.files || []);
    if (fs.length === 0) return;
    setAttachments((a) => [...a, ...fs.map((f) => ({ name: f.name, size: f.size }))]);
    e.target.value = "";
  };

  /* --- bootstrap (extract + create project) --- */
  const buildMyWorkspace = async () => {
    if (!activeId || messages.length < 2) {
      toast.error("Tell me about your startup first — a few messages is enough.");
      return;
    }
    setBootstrapping(true);
    setBootstrapStep("Reading your conversation…");
    try {
      setBootstrapStep("Extracting startup details…");
      const ex = await api.post("/workspace/extract-startup", { conversation_id: activeId });
      setBootstrapStep(`Creating project: ${ex.data.name || "your startup"}…`);
      const r = await api.post("/workspace/bootstrap", {
        conversation_id: activeId,
        name: ex.data.name, tagline: ex.data.tagline,
        industry: ex.data.industry, stage: ex.data.stage,
      });
      setBootstrapStep("Almost there…");
      await refreshProjects();
      setCurrent(r.data.project);
      setBootstrapDone(r.data.project);
      toast.success(`${r.data.project.name} workspace created`);
    } catch (e) {
      const msg = e?.response?.data?.detail || "Couldn't bootstrap your workspace — try again.";
      toast.error(typeof msg === "string" ? msg : "Bootstrap failed");
    } finally {
      setBootstrapping(false);
    }
  };

  /* --- scores for right sidebar (uses dashboard endpoint if a project exists) --- */
  const { current: currentProject } = useProjects();
  const [scores, setScores] = useState({});
  useEffect(() => {
    if (!currentProject) { setScores({}); return; }
    api.get("/workspace/dashboard", { params: { project_id: currentProject.project_id } })
      .then((r) => setScores(r.data?.scores || {})).catch(() => setScores({}));
  }, [currentProject?.project_id]);

  const empty = messages.length === 0;

  return (
    <div className="relative -m-8 min-h-[calc(100vh-0px)]" data-testid="workspace-home">
      <HeroBackdrop />

      <div className="px-4 md:px-8 py-6 grid grid-cols-12 gap-6">
        {/* Left: conversation history */}
        <aside className={`col-span-12 lg:col-span-2 ${sideOpen ? "block" : "hidden lg:block"}`}>
          <button onClick={newConversation}
            className="w-full glow-button rounded-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
            data-testid="new-conversation">
            <Plus className="w-4 h-4" /> New chat
          </button>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-gray-500">History</p>
          <div className="mt-2 space-y-1.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
            {conversations.length === 0 && <p className="text-xs text-gray-400 px-2">No chats yet.</p>}
            {conversations.map((c) => (
              <div key={c.conversation_id}
                className={`group rounded-xl px-3 py-2 cursor-pointer flex items-center justify-between gap-1 ${
                  c.conversation_id === activeId ? "bg-gradient-to-r from-[#F4F1FF] to-[#FFE9F2] border border-[#6C63FF]/15"
                                                 : "hover:bg-gray-50 border border-transparent"
                }`}
                onClick={() => loadConversation(c.conversation_id)}
                data-testid={`conv-${c.conversation_id}`}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-[10px] text-gray-400">{new Date(c.updated_at || c.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteConversation(c.conversation_id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-red-500"
                  aria-label="Delete conversation">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: chat & hero */}
        <main className="col-span-12 lg:col-span-7">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <button onClick={() => setSideOpen((s) => !s)} className="lg:hidden p-2 rounded-full bg-white border border-gray-200"><Menu className="w-4 h-4" /></button>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 text-xs text-gray-500 flex-1 max-w-md">
              <Search className="w-3.5 h-3.5" /> Search across your workspace…
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-white border border-gray-200" aria-label="Notifications"><Bell className="w-4 h-4 text-gray-600" /></button>
              <button onClick={() => navigate("/workspace/dashboard")}
                className="rounded-full px-3.5 py-2 text-xs font-semibold bg-white border border-gray-200 hover:border-gray-300 inline-flex items-center gap-1.5"
                data-testid="open-bi-dashboard">
                BI Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {empty && !bootstrapDone && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <p className="text-2xl">👋 Welcome back, <span className="font-display font-semibold">{user?.name?.split(" ")[0] || "Founder"}</span></p>
              <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05]">
                What would you like to <span className="brand-gradient-text">build today?</span>
              </h1>
              <p className="mt-4 text-gray-600 max-w-2xl">
                I'm your AI Business Co-Founder. Ask me anything about startups, marketing, branding,
                funding, strategy or product — and I'll come back with structured insights, not walls of text.
              </p>

              {/* Quick start grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {QUICK_STARTS.map((q, i) => (
                  <motion.button key={q.title} whileHover={{ y: -4 }} onClick={() => send(q.prompt)}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="group relative text-left rounded-[20px] p-4 bg-white border border-gray-100 hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)] overflow-hidden transition"
                    data-testid={`quickstart-${i}`}>
                    <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${q.gradient} opacity-20 blur-2xl`} />
                    <div className="relative">
                      <span className="text-2xl">{q.emoji}</span>
                      <p className="mt-3 font-display text-sm font-semibold tracking-tight text-gray-900">{q.title}</p>
                      <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">{q.prompt}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Suggested prompts */}
              <div className="mt-6 flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} onClick={() => send(p)}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium border border-gray-200 bg-white hover:border-[#6C63FF] hover:text-[#6C63FF] transition"
                    data-testid={`suggested-${p.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Sparkles className="w-3 h-3 inline mr-1" />{p}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat window */}
          {!empty && (
            <div className="glass rounded-[28px] p-4 md:p-6 border border-white/70" data-testid="chat-window">
              <div ref={scrollRef} className="min-h-[40vh] max-h-[58vh] overflow-y-auto pr-1 space-y-4 no-scrollbar">
                {messages.map((m, i) => <MessageBubble key={i} m={m} onRegenerate={() => send(messages.find((x, j) => j < i && x.role === "user")?.text)} />)}
                {sending && <ThinkingBubble />}
              </div>

              {/* Bootstrap CTA when there's a useful conversation */}
              {messages.filter((m) => m.role === "user").length >= 1 && !bootstrapping && !bootstrapDone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-4 rounded-2xl p-3 flex items-center gap-3 bg-gradient-to-r from-[#F4F1FF] to-[#FFE9F2] border border-white/70">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center"><Rocket className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Ready to make this real?</p>
                    <p className="text-xs text-gray-600">I'll spin up a workspace from this chat and prep your BI dashboard.</p>
                  </div>
                  <button onClick={buildMyWorkspace} className="glow-button rounded-full px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5" data-testid="build-my-workspace">
                    Build my workspace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Bootstrap progress / success */}
          <AnimatePresence>
            {bootstrapping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-4 rounded-[20px] p-5 bg-white border border-gray-100 flex items-center gap-3" data-testid="bootstrap-progress">
                <Loader2 className="w-5 h-5 animate-spin text-[#6C63FF]" />
                <div>
                  <p className="text-sm font-semibold">Bootstrapping your workspace</p>
                  <p className="text-xs text-gray-500">{bootstrapStep}</p>
                </div>
              </motion.div>
            )}
            {bootstrapDone && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-4 rounded-[24px] p-6 relative overflow-hidden text-white"
                style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF4D94 55%, #FF8A00 100%)" }}
                data-testid="bootstrap-success">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220 }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
                <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
                  {bootstrapDone.name} is ready 🚀
                </p>
                <p className="text-sm opacity-90 mt-1">
                  I've created your project. Open your BI dashboard to start generating SWOT, GTM, marketing plan, brand & pitch deck.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => navigate("/workspace/dashboard")} className="bg-white text-gray-900 rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2" data-testid="open-dashboard-cta">
                    Open my dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setBootstrapDone(null)} className="bg-white/10 hover:bg-white/20 rounded-full px-5 py-2.5 text-sm font-semibold">Keep chatting</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart input */}
          <div className="mt-5">
            <div className="rounded-[28px] bg-white border border-gray-200 shadow-[0_10px_36px_rgba(0,0,0,0.04)] overflow-hidden">
              {attachments.length > 0 && (
                <div className="px-4 pt-3 flex flex-wrap gap-2">
                  {attachments.map((a, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1.5">
                      <Paperclip className="w-3 h-3" /> {a.name}
                      <button onClick={() => setAttachments((as) => as.filter((_, k) => k !== i))} className="text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Describe your startup idea or ask anything…"
                rows={2}
                className="w-full resize-none px-5 pt-4 pb-2 text-sm md:text-base outline-none placeholder:text-gray-400"
                data-testid="chat-input"
              />
              <div className="px-3 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <input ref={fileRef} type="file" multiple className="hidden" onChange={onPickFiles}
                         accept=".pdf,.ppt,.pptx,.doc,.docx,.csv,.xls,.xlsx,.png,.jpg,.jpeg" />
                  <button onClick={() => fileRef.current?.click()} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" aria-label="Attach" data-testid="chat-attach">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  {voiceSupported && (
                    <button onClick={() => listening ? stopVoice() : startVoice()}
                            className={`p-2 rounded-full ${listening ? "bg-[#FF4D94]/10 text-[#FF4D94]" : "hover:bg-gray-100 text-gray-500"}`}
                            aria-label="Voice input" data-testid="chat-mic">
                      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                  <span className="ml-2 text-[10px] text-gray-400 hidden md:inline">Enter to send · Shift+Enter for newline</span>
                </div>
                <button onClick={() => send()} disabled={sending || !input.trim()}
                  className="glow-button rounded-full px-5 py-2 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="chat-send">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right: scores + assistant panel */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-[24px] p-5 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF4D94 55%, #FF8A00 100%)" }}>
            <Sparkles className="w-5 h-5" />
            <p className="mt-2 text-xs uppercase tracking-widest font-bold opacity-90">AI Assistant</p>
            <p className="font-display text-xl font-semibold mt-1">
              {currentProject ? `Working on ${currentProject.name}` : "Pick a project to focus on"}
            </p>
            <p className="text-xs opacity-90 mt-1">{currentProject?.industry || "Switch via the BI dashboard."}</p>
          </div>

          <Card title="Business scorecard" subtitle="Live from your latest generations">
            {currentProject ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: "business_health", label: "Health" },
                  { k: "vc_score",        label: "VC Score" },
                  { k: "marketing",       label: "Marketing" },
                  { k: "brand",           label: "Brand" },
                  { k: "pitch",           label: "Pitch" },
                  { k: "overall_ai",      label: "Overall" },
                ].map((s, i) => (
                  <div key={s.k} className="flex flex-col items-center rounded-xl border border-gray-100 p-3">
                    <ScoreRing value={scores[s.k]} size={72} gradientId={`ws-${s.k}`} />
                    <p className="mt-1 text-[10px] uppercase tracking-widest font-bold text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Bootstrap a project from a conversation and your scores appear here.</p>
            )}
          </Card>

          <Card title="Quick actions">
            <div className="space-y-2">
              {[
                { label: "Generate pitch deck", icon: Icons.Presentation, to: "/workspace/funding" },
                { label: "Run SWOT analysis",   icon: Icons.ShieldCheck, to: "/workspace/strategy" },
                { label: "Draft marketing plan",icon: Icons.Megaphone,    to: "/workspace/marketing" },
                { label: "Analyse competitors", icon: Icons.Search,       to: "/workspace/strategy" },
              ].map((it, i) => (
                <button key={i} onClick={() => navigate(it.to)} className="w-full text-left rounded-xl border border-gray-100 p-3 hover:border-[#6C63FF]/30 transition flex items-center gap-2.5">
                  <it.icon className="w-4 h-4 text-[#6C63FF]" />
                  <span className="text-sm font-medium flex-1">{it.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* Floating AI orb */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.7, type: "spring" }}
        onClick={() => setOrbOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full glow-button flex items-center justify-center shadow-2xl"
        data-testid="ai-orb">
        <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full bg-white/40" />
        {orbOpen ? <X className="w-5 h-5 relative" /> : <Bot className="w-5 h-5 relative" />}
      </motion.button>
      <AnimatePresence>
        {orbOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-30 w-[320px] glass rounded-[20px] p-4 border border-white/70 shadow-2xl">
            <p className="text-sm font-semibold">Quick actions</p>
            <p className="text-xs text-gray-500 mb-3">Jump straight to a tool.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "SWOT",       to: "/workspace/strategy",  icon: Icons.ShieldCheck, c: "from-[#6C63FF] to-[#FF4D94]" },
                { label: "GTM",        to: "/workspace/strategy",  icon: Icons.Compass,     c: "from-[#3B82F6] to-[#6C63FF]" },
                { label: "Marketing",  to: "/workspace/marketing", icon: Icons.Megaphone,   c: "from-[#FF4D94] to-[#FF8A00]" },
                { label: "Brand",      to: "/workspace/marketing", icon: Icons.Palette,     c: "from-[#FF8A00] to-[#FFC145]" },
                { label: "Pitch deck", to: "/workspace/funding",   icon: Icons.Presentation,c: "from-[#22C55E] to-[#3B82F6]" },
                { label: "VC score",   to: "/workspace/funding",   icon: Icons.Gauge,       c: "from-[#FFC145] to-[#FF4D94]" },
              ].map((it) => (
                <button key={it.label} onClick={() => { setOrbOpen(false); navigate(it.to); }}
                  className={`rounded-xl p-3 text-white text-left bg-gradient-to-br ${it.c}`}>
                  <it.icon className="w-4 h-4" />
                  <p className="mt-2 text-xs font-semibold">{it.label}</p>
                </button>
              ))}
            </div>
            <button onClick={() => { setOrbOpen(false); navigate("/workspace/dashboard"); }}
              className="mt-3 w-full rounded-full bg-gray-900 text-white text-sm font-semibold py-2 inline-flex items-center justify-center gap-1.5">
              Open BI dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Message bubble ---------- */
function MessageBubble({ m, onRegenerate }) {
  const isUser = m.role === "user";
  const [liked, setLiked] = useState(0); // -1, 0, 1

  const copy = async () => {
    await navigator.clipboard.writeText(m.text || "");
    toast.success("Copied");
  };

  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white px-4 py-2.5 text-sm leading-relaxed">
          {m.text}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3">
          <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-base prose-h3:text-sm prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-table:text-xs prose-code:text-xs prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-gray-400">
          <button onClick={copy} className="p-1.5 hover:bg-gray-50 rounded-md hover:text-gray-700" aria-label="Copy"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={onRegenerate} className="p-1.5 hover:bg-gray-50 rounded-md hover:text-gray-700" aria-label="Regenerate"><RotateCw className="w-3.5 h-3.5" /></button>
          <button onClick={() => setLiked(liked === 1 ? 0 : 1)} className={`p-1.5 hover:bg-gray-50 rounded-md ${liked === 1 ? "text-[#2ECC71]" : "hover:text-gray-700"}`} aria-label="Like"><ThumbsUp className="w-3.5 h-3.5" /></button>
          <button onClick={() => setLiked(liked === -1 ? 0 : -1)} className={`p-1.5 hover:bg-gray-50 rounded-md ${liked === -1 ? "text-[#FF4D94]" : "hover:text-gray-700"}`} aria-label="Dislike"><ThumbsDown className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </motion.div>
  );
}

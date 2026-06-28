import React from "react";
import { motion } from "framer-motion";
import { Bot, Bell, Calendar, FileText, BarChart3, LineChart, PieChart, Settings, FolderKanban, Compass, Search, Megaphone, PiggyBank, ChevronRight, Sparkles } from "lucide-react";
import { SectionEyebrow } from "./Primitives";

const sidebarItems = [
  { icon: FolderKanban, label: "Projects", active: true },
  { icon: Compass, label: "Strategy" },
  { icon: Search, label: "Research" },
  { icon: Megaphone, label: "Marketing" },
  { icon: PiggyBank, label: "Investor" },
  { icon: FileText, label: "Documents" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

export default function DashboardPreview() {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-[#FAFAFC] to-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="max-w-2xl">
          <SectionEyebrow>Workspace</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            Your entire startup, on a single canvas.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Sidebar, center, side panel — every tool a few clicks away. Built to feel as fast and clean as
            a design tool, as smart as a senior strategist.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-14 rounded-[28px] bg-white border border-gray-100 shadow-[0_30px_100px_-30px_rgba(108,99,255,0.35)] overflow-hidden"
        >
          {/* topbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/80 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF4D94]" /><span className="w-2.5 h-2.5 rounded-full bg-[#FFC145]" /><span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" /></div>
              <span className="ml-3 text-xs font-semibold text-gray-500">studlyf.ai / lumen-labs</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-600">
              <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" /> 7 agents running
            </div>
          </div>

          <div className="grid grid-cols-12">
            {/* sidebar */}
            <aside className="hidden lg:flex col-span-2 flex-col border-r border-gray-100 py-5 px-3 bg-[#FBFBFE]">
              {sidebarItems.map((it) => (
                <button
                  key={it.label}
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition ${
                    it.active ? "bg-white shadow-sm text-gray-900 font-semibold border border-gray-100" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <it.icon className={`w-4 h-4 ${it.active ? "text-[#6C63FF]" : ""}`} />
                  {it.label}
                </button>
              ))}
            </aside>

            {/* center */}
            <main className="col-span-12 lg:col-span-7 p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Project</p>
                  <h3 className="font-display text-2xl font-semibold text-gray-900 mt-1">Lumen Labs — Q1 Growth Plan</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-[#2ECC71]/10 text-[#2ECC71] font-semibold">On track</span>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">Pro plan</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "MRR", value: "$24.6k", trend: "+18%", color: "from-[#6C63FF] to-[#FF4D94]" },
                  { label: "Pipeline", value: "$184k", trend: "+9%", color: "from-[#3FA9F5] to-[#6C63FF]" },
                  { label: "VC Score", value: "8.4", trend: "+0.6", color: "from-[#FF7A18] to-[#FF4D94]" },
                  { label: "Runway", value: "14 mo", trend: "stable", color: "from-[#2ECC71] to-[#3FA9F5]" },
                ].map((k) => (
                  <div key={k.label} className="rounded-2xl border border-gray-100 p-4 bg-white">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{k.label}</p>
                    <p className="font-display text-xl font-semibold mt-1">{k.value}</p>
                    <p className={`mt-1 text-xs font-semibold bg-gradient-to-r ${k.color} bg-clip-text text-transparent`}>{k.trend}</p>
                  </div>
                ))}
              </div>

              {/* fake chart */}
              <div className="mt-5 rounded-2xl border border-gray-100 p-5 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Revenue forecast</p>
                  <LineChart className="w-4 h-4 text-gray-400" />
                </div>
                <svg viewBox="0 0 400 120" className="mt-3 w-full h-32">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,90 C40,80 70,40 110,55 C150,70 180,30 220,40 C260,50 300,15 340,25 C370,30 390,15 400,10 L400,120 L0,120 Z"
                    fill="url(#g1)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.4 }}
                    viewport={{ once: true }}
                  />
                  <motion.path
                    d="M0,90 C40,80 70,40 110,55 C150,70 180,30 220,40 C260,50 300,15 340,25 C370,30 390,15 400,10"
                    fill="none" stroke="url(#g2)" strokeWidth="2.5" strokeLinecap="round"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1.4 }}
                  />
                  <linearGradient id="g2" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="50%" stopColor="#FF4D94" />
                    <stop offset="100%" stopColor="#FF7A18" />
                  </linearGradient>
                </svg>
              </div>
            </main>

            {/* right panel */}
            <aside className="col-span-12 lg:col-span-3 border-l border-gray-100 p-5 bg-[#FBFBFE]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500"><Bell className="w-3.5 h-3.5" /> Notifications</div>
              <div className="mt-3 space-y-2.5">
                {[
                  { c: "#6C63FF", t: "New competitor entered market" },
                  { c: "#FF4D94", t: "Pitch deck v3 generated" },
                  { c: "#2ECC71", t: "Investor Maya viewed your one-pager" },
                ].map((n, i) => (
                  <div key={i} className="text-xs rounded-xl bg-white p-3 border border-gray-100 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: n.c }} />
                    <p className="text-gray-700">{n.t}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500"><Calendar className="w-3.5 h-3.5" /> Today</div>
              <div className="mt-3 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] p-3 text-white">
                <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">15:00 • Mentor call</p>
                <p className="text-sm font-semibold mt-1">Prep brief ready <ChevronRight className="inline w-3.5 h-3.5" /></p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500"><PieChart className="w-3.5 h-3.5" /> AI Tasks</div>
              <div className="mt-3 space-y-2 text-xs">
                {["SWOT analysis", "Investor list × 50", "Email sequence (5)"].map((t) => (
                  <div key={t} className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-[#6C63FF]" /><span className="text-gray-700">{t}</span></div>
                ))}
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

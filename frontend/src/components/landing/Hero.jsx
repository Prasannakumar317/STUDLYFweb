import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Play, TrendingUp, Bot, FileText, Target, ArrowUpRight,
  CheckCircle2, Activity, MessageSquare,
} from "lucide-react";
import { FloatingBlobs, fadeUp } from "./Primitives";

const Bar = ({ label, value, color }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-600 w-24 truncate">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
    <span className="text-xs font-semibold text-gray-800 w-9 text-right">{value}%</span>
  </div>
);

export default function Hero({ onGetStarted, onWatchDemo }) {
  return (
    <section id="home" className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <FloatingBlobs />

      <div className="relative max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 grid lg:grid-cols-12 gap-12 items-center">
        {/* LEFT */}
        <motion.div
          initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="lg:col-span-6"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D94]" />
            AI Powered Business Intelligence
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tighter text-gray-900">
            <span className="block">Build.</span>
            <span className="block">Launch.</span>
            <span className="block brand-gradient-text">Scale your startup</span>
            <span className="block">with AI.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-gray-600 leading-relaxed">
            STUDLYF AI helps founders, students, agencies, incubators and investors transform raw ideas into
            successful businesses — with AI-powered strategy, market intelligence, branding, marketing and
            investor tools that actually work.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onGetStarted}
              className="glow-button rounded-full px-7 py-3.5 text-sm font-semibold inline-flex items-center gap-2"
              data-testid="hero-start-free"
            >
              <Sparkles className="w-4 h-4" /> Start Free
            </button>
            <button
              onClick={onWatchDemo}
              className="rounded-full px-6 py-3.5 text-sm font-semibold inline-flex items-center gap-2 glass hover:bg-white/90 transition"
              data-testid="hero-watch-demo"
            >
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 flex items-center gap-5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> No credit card</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> 14-day Pro trial</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> Cancel anytime</div>
          </motion.div>
        </motion.div>

        {/* RIGHT — Animated dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative"
        >
          <div className="relative">
            {/* glow */}
            <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-[#6C63FF]/30 via-[#FF4D94]/20 to-[#FF7A18]/20 blur-3xl" />
            {/* main card */}
            <div className="relative glass rounded-[28px] p-5 md:p-6 border border-white/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D94]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFC145]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
                  </div>
                  <span className="ml-3 text-xs font-semibold text-gray-600">studlyf.ai / dashboard</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Live</span>
              </div>

              <div className="mt-5 grid grid-cols-12 gap-4">
                {/* Project status */}
                <div className="col-span-12 md:col-span-7 bg-white/90 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">Project Status</p>
                      <p className="font-display text-xl font-semibold text-gray-900 mt-1">Lumen Labs / Series A prep</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] flex items-center justify-center text-white">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Bar label="Business Analysis" value={92} color="linear-gradient(90deg,#6C63FF,#FF4D94)" />
                    <Bar label="Market Research" value={78} color="linear-gradient(90deg,#3FA9F5,#6C63FF)" />
                    <Bar label="Content Gen" value={64} color="linear-gradient(90deg,#FF7A18,#FF4D94)" />
                    <Bar label="Investor Ready" value={87} color="linear-gradient(90deg,#2ECC71,#3FA9F5)" />
                  </div>
                </div>

                {/* Side */}
                <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
                  <div className="rounded-2xl p-4 text-white bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] relative overflow-hidden">
                    <Bot className="w-6 h-6 mb-2" />
                    <p className="text-xs opacity-90 font-medium">Active agents</p>
                    <div className="flex items-end justify-between mt-1">
                      <p className="font-display text-3xl font-semibold">7 / 10</p>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div className="mt-3 flex -space-x-2">
                      {[Bot, FileText, Target, Activity].map((Icn, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                          <Icn className="w-3.5 h-3.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/90 border border-gray-100">
                    <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">Live Activity</p>
                    <ul className="mt-3 space-y-2.5 text-xs">
                      {[
                        { c: "#6C63FF", t: "Strategy Agent drafted SWOT" },
                        { c: "#FF4D94", t: "Brand Agent generated 12 logos" },
                        { c: "#2ECC71", t: "Investor Agent: VC score 8.4" },
                      ].map((it, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.25 }}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: it.c }} />
                          {it.t}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI chat preview */}
                <div className="col-span-12 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <MessageSquare className="w-3.5 h-3.5 text-[#6C63FF]" /> Ask STUDLYF
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="inline-block max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-sm bg-white border border-gray-100 text-xs text-gray-700">
                      Generate a 1-slide pitch for an EV charging marketplace.
                    </div>
                    <div className="block text-right">
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                        className="inline-block max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm text-xs text-white bg-gradient-to-br from-[#6C63FF] to-[#FF4D94]"
                      >
                        Drafted • Problem, solution, market $42B, traction +18% MoM, ask $2M.
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mini cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:flex absolute -left-8 top-12 glass rounded-2xl p-3 items-center gap-2 shadow-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC145] to-[#FF7A18] flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">VC Score</p>
                <p className="font-display text-sm font-semibold">8.4 / 10</p>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:flex absolute -right-6 bottom-16 glass rounded-2xl p-3 items-center gap-2 shadow-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2ECC71] to-[#3FA9F5] flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">MRR Forecast</p>
                <p className="font-display text-sm font-semibold">$24K → $61K</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

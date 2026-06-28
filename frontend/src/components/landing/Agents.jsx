import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { AI_AGENTS } from "../../data/landing";
import { SectionEyebrow, fadeUp, stagger } from "./Primitives";

export default function Agents() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <SectionEyebrow>AI Agents</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            Ten specialists. <span className="brand-gradient-text">One team.</span>
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Each agent is trained on the frameworks and playbooks of its discipline. They work in
            parallel — and they remember everything about your startup.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {AI_AGENTS.map((a, i) => {
            const Icon = Icons[a.icon] || Icons.Bot;
            return (
              <motion.div
                key={a.name}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="relative glass rounded-[24px] p-5 transition-all hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
                data-testid={`agent-card-${i}`}
              >
                <div className="relative w-14 h-14 mx-auto">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: a.color }}
                  />
                  <div
                    className="relative w-14 h-14 rounded-full flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}CC)` }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-gray-900">{a.name}</p>
                <p className="text-center text-xs text-gray-500">{a.role}</p>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#2ECC71]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                  ACTIVE
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

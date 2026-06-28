import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { WORKFLOW_STEPS } from "../../data/landing";
import { SectionEyebrow, fadeUp, stagger } from "./Primitives";

export default function Workflow() {
  return (
    <section id="workflow" className="relative py-24 md:py-32 bg-gradient-to-b from-white via-[#FAFAFC] to-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <SectionEyebrow>Workflow</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            From idea to growth — guided every step.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            A single, opinionated path that takes founders from a napkin sketch to a fundable, growing business.
          </p>
        </motion.div>

        {/* desktop timeline */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 hidden lg:block"
        >
          <div className="relative">
            <div className="absolute top-9 left-0 right-0 h-px">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="h-full origin-left bg-gradient-to-r from-[#6C63FF] via-[#FF4D94] to-[#FF7A18]"
              />
            </div>
            <div className="grid grid-cols-9 gap-2">
              {WORKFLOW_STEPS.map((s, i) => {
                const Icon = Icons[s.icon] || Icons.Circle;
                return (
                  <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center text-center">
                    <div
                      className="w-[72px] h-[72px] rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                      style={{ boxShadow: `0 0 0 4px ${s.color}15` }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}AA)` }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-400">Step {i + 1}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* mobile vertical */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12 lg:hidden relative pl-8"
        >
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[#6C63FF] via-[#FF4D94] to-[#FF7A18]" />
          {WORKFLOW_STEPS.map((s, i) => {
            const Icon = Icons[s.icon] || Icons.Circle;
            return (
              <motion.div key={s.label} variants={fadeUp} className="relative pb-6">
                <span
                  className="absolute -left-[26px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: s.color }}
                >
                  <Icon className="w-3 h-3" />
                </span>
                <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500">Step {i + 1}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

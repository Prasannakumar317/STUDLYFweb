import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { SOLUTIONS } from "../../data/landing";
import { SectionEyebrow, fadeUp, stagger } from "./Primitives";

export default function Solutions() {
  return (
    <section id="solutions" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full blob"
           style={{ background: "radial-gradient(circle, #FF4D94 0%, transparent 70%)", opacity: 0.18 }} />
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <SectionEyebrow>Solutions</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            One platform. <span className="brand-gradient-text">Every</span> kind of builder.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Whether you&apos;re a solo founder, a 200-person agency or a venture fund — STUDLYF AI adapts to
            the way <em>you</em> build businesses.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SOLUTIONS.map((s, idx) => {
            const Icon = Icons[s.icon] || Icons.Rocket;
            return (
              <motion.div
                key={s.title}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-[24px] border border-gray-100 p-7 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_22px_60px_rgba(0,0,0,0.09)] transition-all duration-500"
                data-testid={`solution-card-${idx}`}
              >
                {/* watermark number */}
                <span className="absolute -right-2 -top-4 font-display font-bold text-[120px] leading-none text-gray-50 select-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="relative mt-6 font-display text-xl font-semibold text-gray-900">{s.title}</h3>
                <p className="relative mt-1.5 text-sm text-gray-500">{s.sub}</p>

                <ul className="relative mt-5 space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Icons.Check className="w-4 h-4 text-[#2ECC71] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className="relative mt-7 w-full rounded-full py-2.5 text-sm font-semibold text-gray-900 border border-gray-200 hover:border-transparent hover:text-white hover:bg-gradient-to-r hover:from-[#6C63FF] hover:to-[#FF4D94] transition-all duration-300 flex items-center justify-center gap-1.5"
                  data-testid={`solution-cta-${idx}`}
                >
                  Learn more <Icons.ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

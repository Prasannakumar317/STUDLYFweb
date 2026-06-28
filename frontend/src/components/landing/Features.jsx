import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { PLATFORM_FEATURES } from "../../data/landing";
import { SectionEyebrow, fadeUp, stagger } from "./Primitives";

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <SectionEyebrow>Platform</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            Every tool a modern startup actually needs.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Twelve specialised modules, one beautifully connected workspace — strategy, brand, marketing,
            funding and analytics in a single canvas.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {PLATFORM_FEATURES.map((f) => {
            const Icon = Icons[f.icon] || Icons.Sparkles;
            return (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group relative glass rounded-[24px] p-6 shimmer-border transition-all duration-300 hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
                data-testid={`feature-card-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                <button
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-gray-700 group-hover:text-[#6C63FF] transition"
                  data-testid={`feature-learn-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  Learn more
                  <Icons.ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

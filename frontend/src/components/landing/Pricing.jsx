import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { PRICING } from "../../data/landing";
import { SectionEyebrow } from "./Primitives";

export default function Pricing({ onSelect }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto">
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            Simple plans for every <span className="brand-gradient-text">stage</span>.
          </h2>
          <p className="mt-5 text-lg text-gray-600">Start free. Upgrade when your startup needs it.</p>

          <div className="mt-8 inline-flex items-center gap-1 p-1.5 rounded-full glass" data-testid="pricing-toggle">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 text-sm rounded-full font-semibold transition ${!yearly ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
              data-testid="pricing-monthly"
            >Monthly</button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 text-sm rounded-full font-semibold transition flex items-center gap-2 ${yearly ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
              data-testid="pricing-yearly"
            >
              Yearly <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4D94]">-20%</span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING.map((p, i) => {
            const price = yearly ? p.yearly : p.monthly;
            const isFree = price === 0;
            const isCustom = price === null;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-[24px] p-7 transition-all duration-300 ${
                  p.highlight
                    ? "bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white shadow-[0_20px_60px_-15px_rgba(108,99,255,0.55)] -translate-y-2"
                    : "bg-white border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)]"
                }`}
                data-testid={`pricing-card-${p.name.toLowerCase()}`}
              >
                {p.badge && (
                  <span className={`absolute -top-3 right-5 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${
                    p.highlight ? "bg-white text-[#FF4D94]" : "bg-gray-900 text-white"
                  }`}>{p.badge}</span>
                )}
                <p className={`text-sm font-semibold ${p.highlight ? "text-white/90" : "text-gray-500"}`}>{p.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  {isCustom ? (
                    <span className="font-display text-4xl font-semibold">Custom</span>
                  ) : (
                    <>
                      <span className="font-display text-5xl font-semibold tracking-tighter">${price}</span>
                      {!isFree && <span className={`text-sm ${p.highlight ? "text-white/80" : "text-gray-500"}`}>/{yearly ? "mo, billed yearly" : "mo"}</span>}
                    </>
                  )}
                </div>

                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-white" : "text-[#2ECC71]"}`} />
                      <span className={p.highlight ? "text-white/95" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onSelect}
                  className={`mt-7 w-full rounded-full py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition ${
                    p.highlight
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                  data-testid={`pricing-cta-${p.name.toLowerCase()}`}
                >
                  {p.highlight && <Sparkles className="w-4 h-4" />} {p.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

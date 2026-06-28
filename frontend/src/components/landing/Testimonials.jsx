import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { TESTIMONIALS } from "../../data/landing";
import { SectionEyebrow } from "./Primitives";

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const total = TESTIMONIALS.length;

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto">
          <SectionEyebrow>Testimonials</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            Loved by founders & funds alike.
          </h2>
        </div>

        <div className="mt-14 relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {TESTIMONIALS.map((t, i) =>
              i === idx ? (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                  className="glass rounded-[32px] p-8 md:p-12 text-center"
                  data-testid={`testimonial-${i}`}
                >
                  <div className="flex justify-center gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} className="w-5 h-5 fill-[#FFC145] text-[#FFC145]" />
                    ))}
                  </div>
                  <p className="font-display text-xl md:text-2xl text-gray-900 leading-snug tracking-tight">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-7 flex items-center justify-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-gradient-to-r from-[#6C63FF] to-[#FF4D94]" : "w-2 bg-gray-200"}`}
                data-testid={`testimonial-dot-${i}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

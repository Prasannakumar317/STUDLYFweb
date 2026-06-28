import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { METRICS } from "../../data/landing";

const Counter = ({ to, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl font-semibold tracking-tighter">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

export default function Metrics() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="relative rounded-[32px] p-10 md:p-14 overflow-hidden"
             style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF4D94 55%, #FF7A18 100%)" }}>
          <div className="absolute inset-0 opacity-30 grid-bg" style={{ backgroundSize: "44px 44px" }} />
          <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 text-white">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                data-testid={`metric-${i}`}
              >
                <Counter to={m.value} suffix={m.suffix} />
                <p className="mt-2 text-sm md:text-base opacity-90">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

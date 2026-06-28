import React from "react";
import { motion } from "framer-motion";

export const FloatingBlobs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.div
      animate={{ x: [0, 40, -10, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-12%] left-[-6%] w-[480px] h-[480px] rounded-full blob"
      style={{ background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)", opacity: 0.35 }}
    />
    <motion.div
      animate={{ x: [0, -30, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.9, 1.1, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[10%] right-[-8%] w-[520px] h-[520px] rounded-full blob"
      style={{ background: "radial-gradient(circle, #FF4D94 0%, transparent 70%)", opacity: 0.32 }}
    />
    <motion.div
      animate={{ x: [0, 20, -20, 0], y: [0, 30, -30, 0], scale: [1, 1.05, 0.95, 1] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-15%] left-[20%] w-[600px] h-[600px] rounded-full blob"
      style={{ background: "radial-gradient(circle, #FF7A18 0%, transparent 70%)", opacity: 0.25 }}
    />
  </div>
);

export const SectionEyebrow = ({ children }) => (
  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase text-[#6C63FF]">
    <span className="w-6 h-px bg-gradient-to-r from-[#6C63FF] to-[#FF4D94]" />
    {children}
  </span>
);

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

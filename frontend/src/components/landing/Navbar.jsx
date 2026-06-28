import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { LOGO_URL, NAV_LINKS } from "../../data/landing";

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_24px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
      data-testid="site-navbar"
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 h-16 md:h-20 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2.5" data-testid="nav-logo">
          <img src={LOGO_URL} alt="STUDLYF" className="h-9 w-9 object-contain rounded-lg" />
          <span className="font-display font-semibold tracking-tight text-lg text-gray-900">
            STUDLYF <span className="brand-gradient-text">AI</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1 glass rounded-full px-2 py-1.5">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-white/70 transition"
              data-testid={`nav-link-${l.label.toLowerCase()}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="hidden md:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2"
            data-testid="nav-login"
          >
            Log in
          </button>
          <button
            onClick={onGetStarted}
            className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
            data-testid="nav-get-started"
          >
            <Sparkles className="w-4 h-4" /> Get Started
          </button>
          <button
            onClick={() => setOpen((s) => !s)}
            className="lg:hidden p-2 rounded-full glass"
            data-testid="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-base font-medium text-gray-800"
                  data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

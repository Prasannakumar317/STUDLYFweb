import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LayoutDashboard, ChevronDown } from "lucide-react";
import { LOGO_URL, NAV_LINKS } from "../../data/landing";
import { useAuth } from "../../lib/auth";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "../../lib/useMediaQuery";
import DiscoverMegaMenu from "./DiscoverMegaMenu";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const startGoogleAuth = () => {
  const redirectUrl = window.location.origin + "/workspace";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const discoverHoverTimeout = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { user } = useAuth();
  const navigate = useNavigate();

  const openDiscover = () => {
    if (discoverHoverTimeout.current) clearTimeout(discoverHoverTimeout.current);
    setDiscoverOpen(true);
  };
  const scheduleCloseDiscover = () => {
    if (discoverHoverTimeout.current) clearTimeout(discoverHoverTimeout.current);
    discoverHoverTimeout.current = setTimeout(() => setDiscoverOpen(false), 180);
  };
  const toggleDiscover = () => setDiscoverOpen((s) => !s);

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

        <nav className="hidden lg:flex items-center gap-1 glass rounded-full px-2 py-1.5 relative">
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
          <div
            className="relative"
            onMouseEnter={openDiscover}
            onMouseLeave={scheduleCloseDiscover}
          >
            <button
              type="button"
              onClick={toggleDiscover}
              aria-haspopup="dialog"
              aria-expanded={discoverOpen}
              aria-controls="discover-mega"
              className={`px-4 py-1.5 text-sm font-medium rounded-full hover:bg-white/70 transition inline-flex items-center gap-1 ${discoverOpen ? "text-gray-900 bg-white/70" : "text-gray-700"}`}
              data-testid="nav-link-discover"
            >
              Discover
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${discoverOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {discoverOpen && isDesktop && (
                <DiscoverMegaMenu onClose={() => setDiscoverOpen(false)} />
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => navigate("/workspace")}
              className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              data-testid="nav-workspace"
            >
              <LayoutDashboard className="w-4 h-4" /> Workspace
            </button>
          ) : (
            <>
              <button
                onClick={startGoogleAuth}
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
            </>
          )}
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
              <button
                type="button"
                onClick={() => { setOpen(false); setDiscoverOpen(true); }}
                className="py-2.5 text-base font-medium text-gray-800 text-left flex items-center justify-between"
                data-testid="nav-mobile-link-discover"
              >
                Discover <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile mega-menu sheet */}
      <AnimatePresence>
        {discoverOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setDiscoverOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-16 left-3 right-3 max-h-[90vh] overflow-y-auto rounded-[20px] bg-white border border-gray-200 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <DiscoverMegaMenu onClose={() => setDiscoverOpen(false)} panelId="discover-mega-mobile" inline />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, MapPin, Building2, TrendingUp, Newspaper, X,
  Briefcase, Star, Bookmark, Globe2, ArrowUpRight, BookOpen,
} from "lucide-react";
import api from "../../lib/api";

const QUICK_LINKS = [
  { label: "Browse startups",   icon: Building2, to: "/discover" },
  { label: "Startup blog",      icon: BookOpen,  to: "/discover/blog" },
  { label: "Featured lists",    icon: Star,      to: "/discover/lists" },
  { label: "Hiring companies",  icon: Briefcase, to: "/discover/hiring" },
  { label: "Remote jobs",       icon: Globe2,    to: "/discover/remote" },
];

function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function timeAgo(iso) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function LogoFallback({ name }) {
  const initial = (name || "?").trim()[0].toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white text-sm font-display font-semibold flex items-center justify-center shrink-0">
      {initial}
    </div>
  );
}

function CompanyLogo({ logo, name }) {
  const [err, setErr] = useState(false);
  if (!logo || err) return <LogoFallback name={name} />;
  return (
    <img src={logo} alt={`${name} logo`} onError={() => setErr(true)}
         className="w-9 h-9 rounded-xl object-contain bg-white border border-gray-100 shrink-0" />
  );
}

function Skeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
            <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiscoverMegaMenu({ onClose, panelId = "discover-mega", inline = false }) {
  const [startups, setStartups] = useState([]);
  const [stories, setStories] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState({ startups: true, stories: true, industries: true });
  const [error, setError] = useState({});

  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  const panelRef = useRef(null);

  // Fetch lists (parallel)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, st, ind] = await Promise.allSettled([
          api.get("/discover/startups?limit=8"),
          api.get("/discover/stories?limit=5"),
          api.get("/discover/industries"),
        ]);
        if (!alive) return;
        if (s.status === "fulfilled") setStartups(s.value.data.items || []);
        else setError((e) => ({ ...e, startups: true }));
        if (st.status === "fulfilled") setStories(st.value.data.items || []);
        else setError((e) => ({ ...e, stories: true }));
        if (ind.status === "fulfilled") setIndustries(ind.value.data.items || []);
        else setError((e) => ({ ...e, industries: true }));
      } finally {
        if (alive) setLoading({ startups: false, stories: false, industries: false });
      }
    })();
    return () => { alive = false; };
  }, []);

  // Debounced search
  useEffect(() => {
    if (!dq.trim()) { setResults(null); return; }
    let alive = true;
    setSearching(true);
    api.get(`/discover/search?q=${encodeURIComponent(dq)}&limit=8`)
       .then((r) => alive && setResults(r.data.items || []))
       .catch(() => alive && setResults([]))
       .finally(() => alive && setSearching(false));
    return () => { alive = false; };
  }, [dq]);

  // ESC closes; focus trap inside
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    // focus search on open
    const id = setTimeout(() => panelRef.current?.querySelector('input[type="search"]')?.focus(), 50);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(id); };
  }, [onClose]);

  const navigate = useCallback((url, external = false) => {
    if (external) { window.open(url, "_blank", "noopener,noreferrer"); }
    else { window.location.href = url; }
    onClose?.();
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="false"
      aria-label="Discover startups, industries and stories"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`${inline ? "relative" : "fixed left-1/2 -translate-x-1/2 top-[80px] z-50 w-[min(1180px,calc(100vw-32px))]"} rounded-[20px] bg-white border border-gray-200 shadow-[0_22px_60px_rgba(0,0,0,0.12)] overflow-hidden`}
      onMouseLeave={(e) => {
        // only close when leaving the panel itself (parent re-opens on re-hover)
        if (!e.currentTarget.contains(e.relatedTarget)) onClose?.();
      }}
      data-testid="discover-megamenu"
    >
      {/* Search bar */}
      <div className="px-8 pt-7 pb-4 border-b border-gray-100">
        <label className="block relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search startups, industries, or companies…"
            aria-label="Search startups, industries, or companies"
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 outline-none text-sm"
            data-testid="discover-search"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
      </div>

      {/* Search results override */}
      {q.trim() ? (
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto no-scrollbar">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
            {searching ? "Searching…" : `Results for "${q}"`}
          </p>
          {searching ? <Skeleton rows={5} /> : (
            results && results.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {results.map((c) => (
                  <li key={c.slug}>
                    <button
                      onClick={() => navigate(`/discover/company/${c.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition group"
                      data-testid={`search-result-${c.slug}`}
                    >
                      <CompanyLogo logo={c.logo} name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate group-hover:text-[#6C63FF]">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.description || c.industry}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#6C63FF]" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No matches. Try a different query.</p>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 px-8 py-7">
          {/* COL 1 — Trending startups */}
          <div>
            <header className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#6C63FF]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700">Trending Startups</h3>
            </header>
            {loading.startups ? <Skeleton rows={6} /> : error.startups ? (
              <p className="text-sm text-gray-500">Couldn't load startups.</p>
            ) : startups.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing trending right now.</p>
            ) : (
              <ul className="space-y-1">
                {startups.map((c) => (
                  <li key={c.slug}>
                    <button
                      onClick={() => navigate(`/discover/company/${c.slug}`)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 text-left group transition"
                      data-testid={`startup-${c.slug}`}
                    >
                      <CompanyLogo logo={c.logo} name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#6C63FF]">{c.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{c.description}</p>
                        <p className="text-[10px] text-gray-400 truncate flex items-center gap-2">
                          {c.industry && <span>{c.industry}</span>}
                          {c.location && <><span>·</span><MapPin className="w-2.5 h-2.5" />{c.location}</>}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* COL 2 — Industries */}
          <div>
            <header className="flex items-center gap-2 mb-3">
              <Building2 className="w-3.5 h-3.5 text-[#FF4D94]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700">Explore Industries</h3>
            </header>
            {loading.industries ? <Skeleton rows={4} /> : (
              <div className="flex flex-wrap gap-2">
                {industries.map((it) => (
                  <a
                    key={it.slug}
                    href={`/discover?industry=${it.slug}`}
                    onClick={(e) => { e.preventDefault(); navigate(`/discover?industry=${it.slug}`); }}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium border border-gray-200 bg-white hover:border-[#6C63FF] hover:text-[#6C63FF] hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                    data-testid={`industry-${it.slug}`}
                  >
                    {it.name}
                  </a>
                ))}
              </div>
            )}
            <div className="mt-6 rounded-2xl p-4 text-white relative overflow-hidden"
                 style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF4D94 100%)" }}>
              <Bookmark className="w-4 h-4" />
              <p className="mt-2 font-display text-sm font-semibold">Add yours</p>
              <p className="text-[11px] opacity-90 mt-0.5">List your startup on STUDLYF AI to reach builders, mentors and investors.</p>
              <button onClick={() => navigate("/")} className="mt-3 bg-white text-gray-900 text-[11px] font-semibold rounded-full px-3 py-1.5">
                Get featured
              </button>
            </div>
          </div>

          {/* COL 3 — Stories */}
          <div>
            <header className="flex items-center gap-2 mb-3">
              <Newspaper className="w-3.5 h-3.5 text-[#FF7A18]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-700">Trending Stories</h3>
            </header>
            {loading.stories ? <Skeleton rows={5} /> : error.stories ? (
              <p className="text-sm text-gray-500">Couldn't load stories.</p>
            ) : stories.length === 0 ? (
              <p className="text-sm text-gray-500">No stories right now.</p>
            ) : (
              <ul className="space-y-2.5">
                {stories.map((s, i) => (
                  <li key={i}>
                    <button
                      onClick={() => navigate(s.url, true)}
                      className="w-full text-left rounded-xl px-2 py-2 hover:bg-gray-50 group transition"
                      data-testid={`story-${i}`}
                    >
                      <p className="text-sm font-semibold leading-snug group-hover:text-[#6C63FF] line-clamp-2">{s.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                        <span className="truncate max-w-[160px]">{s.source}</span>
                        <span>·</span>
                        <span>{timeAgo(s.time)}</span>
                        {s.score != null && <><span>·</span><span>▲ {s.score}</span></>}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Footer quick links */}
      <div className="border-t border-gray-100 px-8 py-4 bg-gradient-to-r from-[#FAFAFC] to-white">
        <ul className="flex flex-wrap items-center justify-center md:justify-between gap-2">
          {QUICK_LINKS.map((l) => (
            <li key={l.label}>
              <button
                onClick={() => navigate(l.to)}
                className="text-xs font-medium text-gray-700 hover:text-[#6C63FF] inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
                data-testid={`quicklink-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <l.icon className="w-3.5 h-3.5" /> {l.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

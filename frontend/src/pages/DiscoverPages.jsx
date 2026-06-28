import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, MapPin, Building2, Loader2, Search, Briefcase, Star, BookOpen, Globe2 } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

function LogoFallback({ name, size = 56 }) {
  return (
    <div style={{ width: size, height: size }}
         className="rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white text-xl font-display font-semibold flex items-center justify-center shrink-0">
      {(name || "?").trim()[0]?.toUpperCase()}
    </div>
  );
}
function CompanyLogo({ logo, name, size = 56 }) {
  const [err, setErr] = useState(false);
  if (!logo || err) return <LogoFallback name={name} size={size} />;
  return <img src={logo} alt={`${name} logo`} onError={() => setErr(true)} style={{ width: size, height: size }} className="rounded-2xl object-contain bg-white border border-gray-100" />;
}

export function CompanyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    api.get(`/discover/company/${slug}`)
      .then((r) => alive && setData(r.data))
      .catch((e) => alive && setError(e?.response?.status === 404 ? "Company not found." : "Could not load company."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onGetStarted={() => navigate("/")} />
      <main className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-gray-700 inline-flex items-center gap-1 hover:text-[#6C63FF]" data-testid="company-back">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {loading ? (
            <div className="mt-10 flex items-center gap-2 text-gray-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
          ) : error ? (
            <div className="mt-10 rounded-[24px] border border-dashed border-gray-200 p-10 text-center">
              <p className="font-display text-xl font-semibold">{error}</p>
              <Link to="/" className="mt-3 inline-block text-sm font-semibold text-[#6C63FF]">Go back home</Link>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="flex items-start gap-4">
                <CompanyLogo logo={data.logo} name={data.name} size={64} />
                <div className="flex-1 min-w-0">
                  <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tighter">{data.name}</h1>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                    {data.industry && <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{data.industry}</span>}
                    {data.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{data.location}</span>}
                  </p>
                </div>
              </div>

              {data.description && (
                <p className="mt-6 text-lg text-gray-700 leading-relaxed">{data.description}</p>
              )}

              <div className="mt-8 flex flex-wrap gap-2">
                {data.website && (
                  <a href={data.website} target="_blank" rel="noreferrer"
                     className="glow-button rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
                     data-testid="company-website">
                    Visit website <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => navigate("/")} className="rounded-full px-5 py-2.5 text-sm font-semibold border border-gray-200">
                  More on STUDLYF AI
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const STUB_HEADINGS = {
  "/discover":          { title: "Discover startups", subtitle: "Browse the most exciting startups shaping the future.", icon: Building2 },
  "/discover/blog":     { title: "Startup blog",      subtitle: "Stories, playbooks and lessons from real founders.",    icon: BookOpen },
  "/discover/lists":    { title: "Featured lists",    subtitle: "Hand-picked collections of startups worth watching.",   icon: Star },
  "/discover/hiring":   { title: "Hiring companies",  subtitle: "Find startups actively looking for builders like you.",icon: Briefcase },
  "/discover/remote":   { title: "Remote jobs",       subtitle: "Work anywhere. Build everywhere.",                       icon: Globe2 },
};

export function DiscoverListPage({ route = "/discover" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const industry = params.get("industry");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const head = STUB_HEADINGS[route] || STUB_HEADINGS["/discover"];

  useEffect(() => {
    setLoading(true);
    const url = industry ? `/discover/startups?industry=${industry}&limit=16` : "/discover/startups?limit=16";
    api.get(url).then((r) => setItems(r.data.items || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, [industry]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onGetStarted={() => navigate("/")} />
      <main className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <button onClick={() => navigate("/")} className="text-sm font-semibold text-gray-700 inline-flex items-center gap-1 hover:text-[#6C63FF]" data-testid="discover-back">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center">
              <head.icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tighter">
                {head.title}{industry ? <span className="text-gray-400 font-normal"> · {industry}</span> : ""}
              </h1>
              <p className="text-sm text-gray-500">{head.subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-10 flex items-center gap-2 text-gray-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
          ) : items.length === 0 ? (
            <p className="mt-10 text-sm text-gray-500">No results yet. Check back soon.</p>
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((c) => (
                <Link key={c.slug} to={`/discover/company/${c.slug}`}
                      className="rounded-[20px] border border-gray-100 p-4 hover:border-[#6C63FF]/30 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] transition flex items-center gap-3"
                      data-testid={`discover-list-${c.slug}`}>
                  <CompanyLogo logo={c.logo} name={c.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.description}</p>
                    <p className="text-[10px] text-gray-400 truncate">{c.industry} · {c.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

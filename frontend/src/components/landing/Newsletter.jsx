import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success("You're in! Check your inbox for a welcome from STUDLYF AI.");
      setEmail("");
      setLoading(false);
    }, 600);
  };

  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[32px] p-10 md:p-16"
          style={{ background: "linear-gradient(135deg, #FFF 0%, #F4F1FF 60%, #FFE9F2 100%)" }}
        >
          <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full blob"
               style={{ background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)", opacity: 0.35 }} />
          <div className="absolute -bottom-24 -left-10 w-[360px] h-[360px] rounded-full blob"
               style={{ background: "radial-gradient(circle, #FF7A18 0%, transparent 70%)", opacity: 0.25 }} />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold text-gray-700">
                <Mail className="w-3.5 h-3.5 text-[#6C63FF]" /> Weekly newsletter
              </span>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-semibold tracking-tighter text-gray-900">
                Get the <span className="brand-gradient-text">founder briefing</span>.
              </h2>
              <p className="mt-4 text-base md:text-lg text-gray-600 max-w-md">
                One short email. Every Friday. Frameworks, playbooks and prompts that move startups forward.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@startup.com"
                className="flex-1 px-5 py-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 text-sm"
                data-testid="newsletter-email"
              />
              <button
                type="submit"
                disabled={loading}
                className="glow-button rounded-full px-7 py-4 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
                data-testid="newsletter-submit"
              >
                {loading ? "Sending..." : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

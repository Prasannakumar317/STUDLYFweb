import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SignupDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "Founder" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/signup`, { ...form, source: "landing-get-started" });
      setDone(true);
      toast.success("Welcome to STUDLYF AI! We'll be in touch shortly.");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not sign you up — please try again.";
      toast.error(typeof msg === "string" ? msg : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = () => {
    onOpenChange(false);
    setTimeout(() => { setDone(false); setForm({ name: "", email: "", company: "", role: "Founder" }); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleChange(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-md rounded-[24px] border-gray-100 p-0 overflow-hidden" data-testid="signup-dialog">
        {!done ? (
          <>
            <div className="relative px-7 pt-7 pb-2">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blob"
                   style={{ background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)", opacity: 0.25 }} />
              <DialogHeader className="text-left relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-semibold w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" /> Get Started
                </div>
                <DialogTitle className="font-display text-2xl md:text-3xl font-semibold tracking-tight mt-3">
                  Start building your startup with AI.
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create your free workspace in seconds. No credit card.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={submit} className="px-7 pb-7 space-y-3" data-testid="signup-form">
              <input
                type="text" placeholder="Full name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
                data-testid="signup-name"
              />
              <input
                type="email" placeholder="Work email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
                data-testid="signup-email"
              />
              <input
                type="text" placeholder="Company / Project (optional)" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none"
                data-testid="signup-company"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/15 text-sm outline-none bg-white"
                data-testid="signup-role"
              >
                {["Founder", "Student", "Mentor", "Agency", "Incubator", "Investor"].map((r) => <option key={r}>{r}</option>)}
              </select>

              <button
                type="submit" disabled={loading}
                className="glow-button w-full rounded-full py-3.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
                data-testid="signup-submit"
              >
                {loading ? "Creating workspace..." : <>Create my workspace <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-[11px] text-gray-500 text-center">By continuing you agree to our Terms and Privacy.</p>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="px-7 py-12 text-center"
            data-testid="signup-success"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#2ECC71] to-[#3FA9F5] flex items-center justify-center text-white">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold">You&apos;re on the list!</h3>
            <p className="mt-2 text-gray-600 text-sm">We&apos;ll send you an invite to your STUDLYF AI workspace soon.</p>
            <button
              onClick={handleChange}
              className="mt-6 glow-button rounded-full px-6 py-2.5 text-sm font-semibold"
              data-testid="signup-success-close"
            >Continue exploring</button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

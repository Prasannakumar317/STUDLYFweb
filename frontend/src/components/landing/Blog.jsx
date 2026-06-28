import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BLOG_POSTS } from "../../data/landing";
import { SectionEyebrow } from "./Primitives";

export default function Blog() {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-[#FAFAFC] to-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="max-w-xl">
            <SectionEyebrow>Resources</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900">
              Fresh ideas, every week.
            </h2>
          </div>
          <a href="#" className="text-sm font-semibold text-gray-700 inline-flex items-center gap-1" data-testid="blog-view-all">
            View all <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((b, i) => (
            <motion.a
              href="#"
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-[24px] overflow-hidden bg-white border border-gray-100 hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)] transition-all"
              data-testid={`blog-card-${i}`}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[#6C63FF]">{b.tag}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-gray-900 leading-snug">{b.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{b.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-700 group-hover:text-[#FF4D94] transition">
                  Read article <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

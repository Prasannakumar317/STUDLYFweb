import React from "react";
import { Twitter, Linkedin, Github, Youtube } from "lucide-react";
import { LOGO_URL, FOOTER_LINKS } from "../../data/landing";

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 grid grid-cols-2 lg:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="STUDLYF" className="h-9 w-9 object-contain rounded-lg" />
            <span className="font-display font-semibold tracking-tight text-lg text-gray-900">
              STUDLYF <span className="brand-gradient-text">AI</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-600 max-w-xs">
            The complete AI business growth platform — strategy, marketing, branding and funding in one
            beautifully connected workspace.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[Twitter, Linkedin, Github, Youtube].map((Icn, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600 flex items-center justify-center transition" data-testid={`footer-social-${i}`}>
                <Icn className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{heading}</p>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition" data-testid={`footer-link-${l.toLowerCase()}`}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12 mt-14 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} STUDLYF AI. All rights reserved.</p>
        <p className="text-xs text-gray-500">Crafted with care for founders, students & VCs.</p>
      </div>
    </footer>
  );
}

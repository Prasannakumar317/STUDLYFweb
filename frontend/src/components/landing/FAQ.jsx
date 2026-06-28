import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { FAQ_ITEMS } from "../../data/landing";
import { SectionEyebrow } from "./Primitives";

export default function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-gray-900">
            Questions, answered.
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-12 space-y-3" data-testid="faq-accordion">
          {FAQ_ITEMS.map((it, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-gray-100 bg-white px-5 data-[state=open]:shadow-[0_8px_28px_rgba(0,0,0,0.05)]"
              data-testid={`faq-item-${i}`}
            >
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-900 hover:no-underline py-5">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

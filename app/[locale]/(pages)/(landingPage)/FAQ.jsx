"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  { id: "q1" },
  { id: "q2" },
  { id: "q3" },
  { id: "q4" },
  { id: "q5" },
  { id: "q6" },
  { id: "q7" },
];

export default function FAQ() {
  const t = useTranslations("landing.faq");
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 bg-basic overflow-hidden relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className={cn(
            poppins_600,
            "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-highlight to-secondary text-transparent bg-clip-text font-stretch-125%"
          )}>
            {t("title")}
          </h2>
          <p className="text-xl text-ink-inverse-muted font-stretch-110%">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="bg-surface-raised rounded-2xl border border-accent/10 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
                >
                  <span className="text-lg font-semibold text-ink font-stretch-110%">{t(`items.${faq.id}.question`)}</span>
                  <span className={cn(
                    "ms-6 flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-accent transition-transform duration-300",
                    isOpen ? "rotate-180 bg-accent text-ink-inverse" : ""
                  )}>
                    <FaChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="p-6 pt-0 text-ink-muted leading-relaxed border-t border-accent/10 font-stretch-110%">
                    {t(`items.${faq.id}.answer`)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

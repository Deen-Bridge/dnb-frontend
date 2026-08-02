"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "Is DeenBridge free to use?",
    answer:
      "Creating an account, browsing the platform, and joining the community are free. Individual courses and books are priced by the educators who publish them — some are free, others are paid. You always see the price before anything is charged.",
  },
  {
    question: "How do payments work?",
    answer:
      "Paid courses and books are bought with USDC on the Stellar network, straight from your own wallet. You approve every payment yourself and DeenBridge never holds your funds. Settlement takes a few seconds and network fees are a fraction of a cent.",
  },
  {
    question: "Do I need a crypto wallet?",
    answer:
      "Only for paid content. You can create an account, read free books, take free courses, and join spaces without one. When you want to buy something — or start earning as an educator — you connect a Stellar wallet such as Freighter.",
  },
  {
    question: "Can I teach and earn on DeenBridge?",
    answer:
      "Yes. Educators publish courses and books and host live spaces, and they set their own prices. Earnings arrive as USDC in your own wallet within seconds of a sale — no payout threshold and no waiting on a bank.",
  },
  {
    question: "How do I find spaces to join?",
    answer:
      "The Spaces section lists every halaqah, tafsir circle, and open Q&A on the platform. You can filter by what is live now, what is coming up, or the ones you have added to your wishlist.",
  },
  {
    question: "Are the resources and scholars verified?",
    answer:
      "We take authenticity seriously. Educators are reviewed before they can publish, and our AI assistant grades hadith, checks Qur'an citations, and sends doubtful religious answers to a scholar rather than guessing.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use industry-standard security measures, and because payments are non-custodial we never hold your funds. What the AI assistant remembers about you can be read on request and deleted in full at any time.",
  },
];

export default function FAQ() {
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
            "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-highlight to-accent text-transparent bg-clip-text font-stretch-125%"
          )}>
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-ink-muted font-stretch-110%">
            Everything you need to know about DeenBridge.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="bg-surface-raised rounded-2xl border border-accent/10 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="text-lg font-semibold text-ink font-stretch-110%">{faq.question}</span>
                  <span className={cn(
                    "ml-6 flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-accent transition-transform duration-300",
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
                    {faq.answer}
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

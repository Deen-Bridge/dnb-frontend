"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "Is DeenBridge free to use?",
    answer: "Yes, DeenBridge is fundamentally free to join and use. We believe in making authentic Islamic knowledge and community connection accessible to everyone."
  },
  {
    question: "How do I find spaces or events near me?",
    answer: "You can use our 'Spaces' and 'Events' features to discover local meetups, study circles, and community gatherings. You can also filter by location and interests."
  },
  {
    question: "Are the resources and scholars verified?",
    answer: "We take authenticity seriously. Our team works diligently to ensure that the scholars, resources, and book recommendations on our platform align with authentic Islamic teachings."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We employ industry-standard security measures to protect your personal information and ensure a safe environment for all our community members."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-4 sm:px-6 bg-basic overflow-hidden relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className={cn(
            poppins_600,
            "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text"
          )}>
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about DeenBridge.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="text-lg font-semibold text-gray-800">{faq.question}</span>
                  <span className={cn(
                    "ml-6 flex-shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-accent transition-transform duration-300",
                    isOpen ? "rotate-180 bg-accent text-white" : ""
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
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">
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

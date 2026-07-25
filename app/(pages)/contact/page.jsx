"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import Footer from "../(landingPage)/Footer";
import { FaEnvelope, FaMapMarkerAlt, FaTwitter, FaInstagram } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <main className="flex-1">
        {/* Header Section */}
        <section className="relative pt-24 pb-12 px-4 sm:px-6 bg-gradient-to-b from-white to-green-50 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h1 className={cn(
              poppins_600,
              "text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text"
            )}>
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have questions, feedback, or want to partner with us? We'd love to hear from you. 
              Drop us a message and our team will get back to you shortly.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-12 px-4 sm:px-6 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-accent/10">
                  <h3 className={cn(poppins_600, "text-2xl font-bold text-gray-800 mb-6")}>
                    Contact Information
                  </h3>
                  
                  <div className="space-y-6 text-gray-600">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-accent flex-shrink-0">
                        <FaEnvelope className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Email Us</p>
                        <a href="mailto:salaam@deenbridge.com" className="hover:text-accent transition-colors">
                          salaam@deenbridge.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-accent flex-shrink-0">
                        <FaMapMarkerAlt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Global Headquarters</p>
                        <p>Operating digitally worldwide to serve the Ummah.</p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-8 border-gray-100" />

                  <h4 className="font-semibold text-gray-800 mb-4">Follow Us</h4>
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-accent hover:text-white transition-all">
                      <FaTwitter />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-accent hover:text-white transition-all">
                      <FaInstagram />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-accent/10">
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <input 
                        type="text" 
                        placeholder="Ahmed"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Ali"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="ahmed@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <textarea 
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none"
                    ></textarea>
                  </div>

                  <Button
                    wide
                    round
                    className="w-full bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-white py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Send Message
                  </Button>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

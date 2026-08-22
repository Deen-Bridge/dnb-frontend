import Navbar from "@/components/molecules/ladingpage/Navbar";
import Hero from "./(pages)/(landingPage)/Hero";
import Footer from "./(pages)/(landingPage)/Footer";
import React from "react";
import About from "./(pages)/(landingPage)/About";
import WhyDeenBridge from "./(pages)/(landingPage)/WhyDeenBridge";
import HowItWorks from "./(pages)/(landingPage)/HowItWorks";
// import Testimonials from "./(pages)/(landingPage)/Testimonials"; // hidden until real users
import Mission from "./(pages)/(landingPage)/Mission";
import FAQ from "./(pages)/(landingPage)/FAQ";
import CTA from "./(pages)/(landingPage)/CTA";
import Sources from "./(pages)/(landingPage)/Sources";
// import Stats from "./(pages)/(landingPage)/Stats"; // hidden until real numbers
import FeaturedContent from "./(pages)/(landingPage)/FeaturedContent";
import StellarSection from "./(pages)/(landingPage)/StellarSection";
import { siteUrl, siteName, siteDescription } from "@/lib/config/site.config";

export const metadata = {
  title: { absolute: "Deen Bridge — Authentic Islamic Education" },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Deen Bridge — Authentic Islamic Education",
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Deen Bridge — authentic Islamic education, together.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@deen_bridge",
    creator: "@deen_bridge",
    title: "Deen Bridge — Authentic Islamic Education",
    description: siteDescription,
    images: ["/og.png"],
  },
};

const page = () => {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <About />
        <Mission />
        <WhyDeenBridge />
        <FeaturedContent />
        {/* Hidden until we have real numbers — Stats shows placeholder traction (12K+ learners, etc.) */}
        {/* <Stats /> */}
        <HowItWorks />
        <StellarSection />
        {/* Hidden until we have real users — Testimonials are placeholder quotes from fictional people */}
        {/* <Testimonials /> */}
        <Sources />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
};

export default page;

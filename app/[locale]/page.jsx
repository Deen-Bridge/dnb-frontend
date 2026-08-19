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

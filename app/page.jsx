import Navbar from "@/components/molecules/ladingpage/Navbar";
import Hero from "./(pages)/(landingPage)/Hero";
import Footer from "./(pages)/(landingPage)/Footer";
import React from "react";
import About from "./(pages)/(landingPage)/About";
import WhyDeenBridge from "./(pages)/(landingPage)/WhyDeenBridge";
import HowItWorks from "./(pages)/(landingPage)/HowItWorks";
import Testimonials from "./(pages)/(landingPage)/Testimonials";
import Mission from "./(pages)/(landingPage)/Mission";
import FAQ from "./(pages)/(landingPage)/FAQ";
import CTA from "./(pages)/(landingPage)/CTA";
import Sources from "./(pages)/(landingPage)/Sources";
import Stats from "./(pages)/(landingPage)/Stats";
import FeaturedContent from "./(pages)/(landingPage)/FeaturedContent";
import StellarSection from "./(pages)/(landingPage)/StellarSection";

const page = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Mission />
      <WhyDeenBridge />
      <FeaturedContent />
      <Stats />
      <HowItWorks />
      <StellarSection />
      <Testimonials />
      <Sources />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
};

export default page;

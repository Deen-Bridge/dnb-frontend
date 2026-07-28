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
import Partners from "./(pages)/(landingPage)/Partners";
import Stats from "./(pages)/(landingPage)/Stats";

const page = () => {
  return (
    <>
      <Hero />
      <About />
      <Mission />
      <WhyDeenBridge />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <Partners />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
};

export default page;

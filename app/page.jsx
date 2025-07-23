import Hero from "./(pages)/(landingPage)/Hero";
import Footer from "./(pages)/(landingPage)/Footer";
import React from "react";
import About from "./(pages)/(landingPage)/About";
import WhyDeenBridge from "./(pages)/(landingPage)/WhyDeenBridge";
import HowItWorks from "./(pages)/(landingPage)/HowItWorks";
import Testimonials from "./(pages)/(landingPage)/Testimonials";
import CTA from "./(pages)/(landingPage)/CTA";
import Partners from "./(pages)/(landingPage)/Partners";

const page = () => {
  return (
    <>
      <Hero />
      <About />
      <WhyDeenBridge />
      <HowItWorks />
      <Testimonials />
      <Partners />
      <CTA />
      <Footer />
    </>
  );
};

export default page;

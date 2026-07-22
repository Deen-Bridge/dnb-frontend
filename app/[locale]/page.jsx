import Hero from "./(pages)/(landingPage)/Hero";
import Footer from "./(pages)/(landingPage)/Footer";
import React from "react";
import About from "./(pages)/(landingPage)/About";
import WhyDeenBridge from "./(pages)/(landingPage)/WhyDeenBridge";
import HowItWorks from "./(pages)/(landingPage)/HowItWorks";
// import Testimonials from "./(pages)/(landingPage)/Testimonials"; // re-enable with real testimonials
import CTA from "./(pages)/(landingPage)/CTA";
import Partners from "./(pages)/(landingPage)/Partners";
import Stats from "./(pages)/(landingPage)/Stats";

const page = () => {
  return (
    <>
      <Hero />
      <About />
      <WhyDeenBridge />
      <Stats />
      {/* <HowItWorks /> */}
      {/* <Testimonials /> — disabled until we have real, attributable testimonials */}
      <Partners />
      <CTA />
      <Footer />
    </>
  );
};

export default page;

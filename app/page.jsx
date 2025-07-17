import Hero from "./(pages)/(landingPage)/Hero";
import Footer from "./(pages)/(landingPage)/Footer";
import React from "react";
import About from "./(pages)/(landingPage)/About";
import WhyDeenBridge from "./(pages)/(landingPage)/WhyDeenBridge";
import HowItWorks from "./(pages)/(landingPage)/HowItWorks";
import Testimonials from "./(pages)/(landingPage)/Testimonials";

const page = () => {
  return (
    <>
      <Hero />
      <About />
      <WhyDeenBridge />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </>
  );
};

export default page;

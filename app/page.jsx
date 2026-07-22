import Hero from "./(pages)/(landingPage)/Hero";
import Footer from "./(pages)/(landingPage)/Footer";
import About from "./(pages)/(landingPage)/About";
import WhyDeenBridge from "./(pages)/(landingPage)/WhyDeenBridge";
import Testimonials from "./(pages)/(landingPage)/Testimonials";
import CTA from "./(pages)/(landingPage)/CTA";
import Partners from "./(pages)/(landingPage)/Partners";
import Stats from "./(pages)/(landingPage)/Stats";
import FeaturedCourses from "./(pages)/(landingPage)/FeaturedCourses";

const Page = () => {
  return (
    <>
      <Hero />
      <About />
      <WhyDeenBridge />
      <Stats />
      <FeaturedCourses />
      <Testimonials />
      <Partners />
      <CTA />
      <Footer />
    </>
  );
};

export default Page;

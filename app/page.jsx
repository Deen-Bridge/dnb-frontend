import Hero from "./(pages)/(landingPage)/Hero";
import Footer from "./(pages)/(landingPage)/Footer";
import About from "./(pages)/(landingPage)/About";
import WhyDeenBridge from "./(pages)/(landingPage)/WhyDeenBridge";
import Stats from "./(pages)/(landingPage)/Stats";
import FeaturedCourses from "./(pages)/(landingPage)/FeaturedCourses";
import Testimonials from "./(pages)/(landingPage)/Testimonials";
import Partners from "./(pages)/(landingPage)/Partners";
import CTA from "./(pages)/(landingPage)/CTA";

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

import Header from "../layouts/header1";
import HomeSlider from "../components/home-slider";
import Features from "../components/features";
import About from "../components/about1";
import CounterUp from "../components/counterUp";
import Programs from "../components/programs";
import Testimonials1 from "../components/testimonials1";
import Events from "../components/events";
import Clients from "../components/clients1";
import Instructors from "../components/instructors2";
import Blog from "../components/blog2";
import CTA from "../components/cta2";
import Footer from "../layouts/footer";


export default function Home() {
  return (
    <>
      <Header />
      <HomeSlider/>
      <Features/>
      <About/>
      <CounterUp className="nmt100"/>
      <Programs/>
      <Testimonials1/>
      <Events/>
      <Clients/>
      <Instructors/>
      <Blog/>
      <CTA/>
      <Footer />
    </>
  );
}
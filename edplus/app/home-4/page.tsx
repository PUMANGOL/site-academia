import Header from "../layouts/header2";
import HomeBanner from "../components/home-banner3";
import Features from "../components/features2";
import Category from "../components/course-category";
import About from "../components/about2";
import CounterUp from "../components/counterUp";
import Courses from "../components/courses3";
import Video from "../components/video";
import Testimonials from "../components/testimonials2";
import Instructors from "../components/instructors1";
import Clients from "../components/clients2";
import Blog from "../components/blog1";
import CTA from "../components/cta1";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
      <HomeBanner/>
      <Features/>
      <About className="pb120" />
      <Category/>
      <CounterUp/>
      <Courses/>
      <Video/>
      <Testimonials/>
      <Instructors/>
      <Clients/>
      <Blog/>
      <CTA/>
      <Footer />
    </>
  );
}
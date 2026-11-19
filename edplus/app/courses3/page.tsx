import Header from "../layouts/header2";
import Banner from "../components/banner";
import Courses from "../template-parts/courses3";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="courses" />
        <Courses/>
      <Footer />
    </>
  );
}
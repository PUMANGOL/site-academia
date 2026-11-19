import Header from "../layouts/header2";
import Banner from "../components/banner";
import Contact from "../components/contact";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="contact" bgImage="/assets/img/academia/hero-braids.jpg" />
        <Contact/>
      <Footer />
    </>
  );
}
import Header from "../layouts/header2";
import Banner from "../components/banner";
import Faq from "../template-parts/faq";
import Footer from "../layouts/foooter2";


export default function FAQ() {
  return (
    <>
      <Header />
        <Banner page="faq" />
        <Faq/>
      <Footer />
    </>
  );
}
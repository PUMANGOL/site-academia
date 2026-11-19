import Header from "../layouts/header2";
import Banner from "../components/banner";
import Cheeckout from "../template-parts/checkout";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="checkout" />
        <Cheeckout/>
      <Footer />
    </>
  );
}
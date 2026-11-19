import Header from "../layouts/header2";
import Banner from "../components/banner";
import Cart from "../template-parts/cart";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="cart" />
        <Cart/>
      <Footer />
    </>
  );
}
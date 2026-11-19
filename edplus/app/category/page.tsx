import Header from "../layouts/header2";
import Banner from "../components/banner";
import Categories from "../template-parts/categories";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="category" />
        <Categories/>
      <Footer />
    </>
  );
}
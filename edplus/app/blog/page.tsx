import Header from "../layouts/header2";
import Banner from "../components/banner";
import Blog from "../template-parts/blog";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="blog" />
        <Blog/>
      <Footer />
    </>
  );
}
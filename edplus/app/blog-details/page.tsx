import Header from "../layouts/header2";
import Banner from "../components/banner";
import BlogDetails from "../template-parts/blog-details";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="blogDetails" />
        <BlogDetails />
      <Footer />
    </>
  );
}
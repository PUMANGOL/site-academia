import Header from "../layouts/header2";
import Banner from "../components/banner";
import GridBlog from "../template-parts/grid-blog";
import Footer from "../layouts/foooter2";


export default function Home() {
  return (
    <>
      <Header />
        <Banner page="gridBlog" />
        <GridBlog/>
      <Footer />
    </>
  );
}
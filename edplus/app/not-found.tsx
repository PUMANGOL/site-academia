import Header from "./layouts/header1";
import Banner from './components/banner';
import NotFoundPage from './template-parts/404';
import Footer from "./layouts/foooter2";

export default function Notfound() {
  return (
    <>
    <Header/>
    <Banner page="notFound" />
    <NotFoundPage/>
    <Footer/>
    </>
  )
}

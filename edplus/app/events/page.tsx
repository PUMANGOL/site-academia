import Header from "../layouts/header2";
import Banner from "../components/banner";
import Events from "../template-parts/events";
import Footer from "../layouts/foooter2";


export default function EventsPage() {
  return (
    <>
      <Header />
        <Banner page="events" />
        <Events/>
      <Footer />
    </>
  );
}
import Header from "../layouts/header2";
import Banner from "../components/banner";
import InstructorsList from "../template-parts/instructors-list";
import Footer from "../layouts/foooter2";

export default function InstructorsPage() {
	return (
		<>
			<Header />
			<Banner page="instructors" bgImage="/assets/img/academia/hero-braids.jpg" />
			<InstructorsList />
			<Footer />
		</>
	);
}
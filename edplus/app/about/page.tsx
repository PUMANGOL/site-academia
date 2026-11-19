import type { Metadata } from "next";
import Header from "../layouts/header2";
import Footer from "../layouts/foooter2";
import AcademiaAbout from "../components/academia-about";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "A Academia",
};

export default function AboutPage() {
	return (
		<>
			<Header />
			<AcademiaAbout />
			<Footer />
		</>
	);
}

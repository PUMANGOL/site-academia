import Header from "@/app/layouts/header2";
import Banner from "@/app/components/banner";
import Footer from "@/app/layouts/foooter2";

export default function SiteShell({
	page,
	children,
	bgImage = "/assets/img/academia/hero-stage.jpg",
}: {
	page: string;
	children: React.ReactNode;
	bgImage?: string;
}) {
	return (
		<>
			<Header />
			<Banner page={page} bgImage={bgImage} />
			{children}
			<Footer />
		</>
	);
}

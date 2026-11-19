import Header from "./layouts/header2";
import Footer from "./layouts/foooter2";
import PageBlocks from "./components/page-blocks/page-blocks";
import { loadPage } from "./components/page-blocks/load-page";

export const dynamic = "force-dynamic";

export default async function Home() {
	// Até ser publicada no backoffice (Páginas), a home usa o layout padrão.
	const page = await loadPage("home");

	return (
		<>
			<Header />
			<PageBlocks {...page} />
			<Footer />
		</>
	);
}

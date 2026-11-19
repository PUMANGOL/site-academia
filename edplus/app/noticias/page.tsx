import Header from "@/app/layouts/header2";
import Footer from "@/app/layouts/foooter2";
import PageBlocks from "@/app/components/page-blocks/page-blocks";
import { loadPage } from "@/app/components/page-blocks/load-page";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
	// Até ser publicada no backoffice (Páginas), usa o layout padrão: banner + lista de notícias.
	const page = await loadPage("news");

	return (
		<>
			<Header />
			<PageBlocks {...page} />
			<Footer />
		</>
	);
}

import Header from "../layouts/header2";
import Footer from "../layouts/foooter2";
import PageBlocks from "../components/page-blocks/page-blocks";
import { loadPage } from "../components/page-blocks/load-page";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string | string[] }>;
}) {
	const [page, { q }] = await Promise.all([loadPage("courses"), searchParams]);
	const searchQuery = (Array.isArray(q) ? q[0] : q) ?? "";

	return (
		<>
			<Header />
			<PageBlocks {...page} searchQuery={searchQuery} />
			<Footer />
		</>
	);
}

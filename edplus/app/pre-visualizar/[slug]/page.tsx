import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LivePreview from "@/app/components/page-blocks/live-preview";
import { loadPage } from "@/app/components/page-blocks/load-page";
import Footer from "@/app/layouts/foooter2";
import Header from "@/app/layouts/header2";
import { getAdminSession } from "@/lib/admin-auth";
import { isEditablePage } from "@/lib/page-blocks";

// Mostra o rascunho de uma página. Usado pelo iframe do editor de páginas no backoffice,
// que depois envia as alterações por postMessage à medida que o administrador edita.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Pré-visualização",
	robots: { index: false, follow: false },
};

export default async function PagePreview({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const session = await getAdminSession();
	if (!session || !isEditablePage(slug)) notFound();

	const { blocks, ...data } = await loadPage(slug, { draft: true });

	return (
		<>
			<Header />
			<LivePreview initialBlocks={blocks} {...data} />
			<Footer />
		</>
	);
}

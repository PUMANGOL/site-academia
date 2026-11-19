import { notFound } from "next/navigation";
import PageBuilder from "@/app/backoffice/components/page-builder/page-builder";
import PageHeader from "@/app/backoffice/components/page-header";
import { getPageBySlug } from "@/db/queries/content";
import { editablePages, isEditablePage } from "@/lib/page-blocks";

export const dynamic = "force-dynamic";

export default async function EditPagePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	if (!isEditablePage(slug)) notFound();

	const definition = editablePages[slug];
	const page = await getPageBySlug(slug);
	const blocks = page?.draftBlocks ?? definition.defaultBlocks;
	const hasUnpublishedChanges =
		page !== null && JSON.stringify(page.draftBlocks) !== JSON.stringify(page.publishedBlocks);

	return (
		<div>
			<PageHeader
				title={definition.title}
				description="Arraste os blocos para mudar a ordem. Clique num bloco para editar o conteúdo."
			/>
			<PageBuilder
				slug={slug}
				initialBlocks={blocks}
				initialPublishedAt={page?.publishedAt?.toISOString() ?? null}
				hasUnpublishedChanges={hasUnpublishedChanges}
			/>
		</div>
	);
}

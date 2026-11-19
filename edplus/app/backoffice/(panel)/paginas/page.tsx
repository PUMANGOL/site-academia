import Link from "next/link";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import PageHeader from "@/app/backoffice/components/page-header";
import { getPageBySlug } from "@/db/queries/content";
import { editablePageOrder, editablePages } from "@/lib/page-blocks";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminPagesPage() {
	const rows = await Promise.all(
		editablePageOrder.map(async (slug) => ({ slug, ...editablePages[slug], page: await getPageBySlug(slug) }))
	);

	return (
		<div>
			<PageHeader
				title="Páginas"
				description="Montar as páginas do site com blocos: arrastar, editar textos e imagens, publicar."
			/>
			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Página</th>
							<th>Estado</th>
							<th>Blocos</th>
							<th>Última publicação</th>
							<th className="text-end">Ações</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(({ slug, title, path, page, defaultBlocks }) => {
							const blocks = page?.publishedBlocks ?? defaultBlocks;
							const pending =
								page !== null &&
								JSON.stringify(page.draftBlocks) !== JSON.stringify(page.publishedBlocks);
							return (
								<tr key={slug}>
									<td>
										<p className="mb-0 fw-medium">{title}</p>
										<p className="mb-0 small text-muted">{path}</p>
									</td>
									<td>
										{!page?.publishedAt ? (
											<AdminBadge variant="muted">Layout padrão</AdminBadge>
										) : pending ? (
											<AdminBadge variant="warning">Rascunho por publicar</AdminBadge>
										) : (
											<AdminBadge variant="success">Publicado</AdminBadge>
										)}
									</td>
									<td>{blocks.filter((block) => !block.hidden).length} visíveis</td>
									<td>{page?.publishedAt ? dateFormat.format(page.publishedAt) : "—"}</td>
									<td className="text-end">
										<Link href={path} target="_blank" className="admin-btn admin-btn-ghost admin-btn-sm me-2">
											<i className="ph ph-arrow-square-out" aria-hidden /> Ver
										</Link>
										<Link href={`/backoffice/paginas/${slug}`} className="admin-btn admin-btn-outline admin-btn-sm">
											<i className="ph ph-pencil-simple" aria-hidden /> Editar
										</Link>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

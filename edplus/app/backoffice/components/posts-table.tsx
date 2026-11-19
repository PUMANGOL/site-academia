"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost, updatePostStatus } from "@/app/actions/admin/posts";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import AdminModal from "@/app/backoffice/components/admin-modal";
import {
	AdminDropdown,
	AdminDropdownItem,
	AdminDropdownSeparator,
} from "@/app/backoffice/components/admin-dropdown";
import {
	AdminFilterBar,
	AdminFilterEmptyRow,
	AdminFilterSearch,
	AdminFilterSelect,
	matchesSearch,
} from "@/app/backoffice/components/admin-filters";
import type { ContentStatus } from "@/db/schema";

type PostRow = {
	id: string;
	slug: string;
	titlePt: string;
	categoryPt: string;
	status: ContentStatus;
	isFeatured: boolean;
	publishedAt: Date | null;
};

const statusVariant: Record<ContentStatus, "success" | "warning" | "muted"> = {
	published: "success",
	draft: "warning",
	archived: "muted",
};

const statusLabel: Record<ContentStatus, string> = {
	published: "Publicado",
	draft: "Rascunho",
	archived: "Arquivado",
};

const statusOptions = (Object.keys(statusLabel) as ContentStatus[]).map((value) => ({
	value,
	label: statusLabel[value],
}));

const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium" });

export default function PostsTable({ posts }: { posts: PostRow[] }) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<PostRow | null>(null);

	const filtered = posts.filter(
		(post) =>
			matchesSearch(search, post.titlePt, post.slug, post.categoryPt) &&
			(!status || post.status === status)
	);

	function handleStatus(id: string, next: ContentStatus) {
		startTransition(async () => {
			await updatePostStatus(id, next);
			router.refresh();
		});
	}

	function confirmDelete() {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		startTransition(async () => {
			await deletePost(id);
			setDeleteTarget(null);
			router.refresh();
		});
	}

	if (!posts.length) {
		return <div className="admin-empty">Ainda não há notícias. Crie a primeira.</div>;
	}

	return (
		<>
			<AdminFilterBar
				shown={filtered.length}
				total={posts.length}
				hasFilters={Boolean(search || status)}
				onClear={() => {
					setSearch("");
					setStatus("");
				}}
			>
				<AdminFilterSearch
					value={search}
					onChange={setSearch}
					placeholder="Pesquisar por título, slug ou categoria"
				/>
				<AdminFilterSelect
					label="Estado"
					value={status}
					onChange={setStatus}
					options={statusOptions}
				/>
			</AdminFilterBar>
			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Título</th>
							<th>Estado</th>
							<th>Categoria</th>
							<th>Publicação</th>
							<th className="text-end">Ações</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? <AdminFilterEmptyRow colSpan={5} /> : null}
						{filtered.map((post) => {
							return (
								<tr key={post.id}>
									<td>
										<p className="mb-0 fw-medium">
											{post.titlePt}
											{post.isFeatured ? (
												<i className="ph ph-star ms-2 text-warning" title="Destaque" aria-hidden />
											) : null}
										</p>
										<p className="mb-0 small text-muted">{post.slug}</p>
									</td>
									<td>
										<AdminBadge variant={statusVariant[post.status]}>
											{statusLabel[post.status]}
										</AdminBadge>
									</td>
									<td>{post.categoryPt || "—"}</td>
									<td>{post.publishedAt ? dateFormat.format(post.publishedAt) : "—"}</td>
									<td className="text-end">
										<AdminDropdown
											trigger={
												<button
													type="button"
													className="admin-btn admin-btn-ghost admin-btn-sm"
													disabled={pending}
												>
													<i className="ph ph-dots-three-outline" aria-hidden />
													<span className="sr-only">Ações</span>
												</button>
											}
										>
											<AdminDropdownItem href={`/backoffice/noticias/${post.id}`}>
												<i className="ph ph-pencil-simple" aria-hidden />
												Editar
											</AdminDropdownItem>
											{post.status === "published" ? (
												<>
													<AdminDropdownItem href={`/noticias/${post.slug}`}>
														<i className="ph ph-arrow-square-out" aria-hidden />
														Ver no site
													</AdminDropdownItem>
													<AdminDropdownItem onSelect={() => handleStatus(post.id, "draft")}>
														<i className="ph ph-arrow-u-up-left" aria-hidden />
														Despublicar
													</AdminDropdownItem>
												</>
											) : (
												<AdminDropdownItem onSelect={() => handleStatus(post.id, "published")}>
													<i className="ph ph-paper-plane-tilt" aria-hidden />
													Publicar
												</AdminDropdownItem>
											)}
											<AdminDropdownSeparator />
											<AdminDropdownItem danger onSelect={() => setDeleteTarget(post)}>
												<i className="ph ph-trash" aria-hidden />
												Eliminar
											</AdminDropdownItem>
										</AdminDropdown>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<AdminModal
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				title="Eliminar notícia?"
				footer={
					<>
						<button
							type="button"
							className="admin-btn admin-btn-outline"
							onClick={() => setDeleteTarget(null)}
							disabled={pending}
						>
							Cancelar
						</button>
						<button
							type="button"
							className="admin-btn admin-btn-danger"
							onClick={confirmDelete}
							disabled={pending}
						>
							{pending ? "A eliminar..." : "Eliminar"}
						</button>
					</>
				}
			>
				<p className="mb-0">
					Esta ação não pode ser desfeita. Eliminar a notícia &quot;
					{deleteTarget?.titlePt}&quot;?
				</p>
			</AdminModal>
		</>
	);
}

"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	createCategory,
	deleteCategory,
	toggleCategoryActive,
	updateCategory,
	type CategoryFormInput,
} from "@/app/actions/admin/categories";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import {
	AdminDropdown,
	AdminDropdownItem,
	AdminDropdownSeparator,
} from "@/app/backoffice/components/admin-dropdown";
import AdminModal from "@/app/backoffice/components/admin-modal";
import {
	AdminFilterBar,
	AdminFilterEmptyRow,
	AdminFilterSearch,
	AdminFilterSelect,
	matchesSearch,
} from "@/app/backoffice/components/admin-filters";

const activeOptions = [
	{ value: "active", label: "Ativas" },
	{ value: "inactive", label: "Inativas" },
];

type CategoryRow = {
	id: string;
	slug: string;
	namePt: string;
	nameEn: string;
	sortOrder: number;
	isActive: boolean;
};

export default function CategoriesPanel({
	categories,
}: {
	categories: CategoryRow[];
}) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<CategoryRow | null>(null);
	const [active, setActive] = useState(true);
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
	const [deactivateTarget, setDeactivateTarget] = useState<CategoryRow | null>(null);
	const [search, setSearch] = useState("");
	const [activeFilter, setActiveFilter] = useState("");

	const filtered = categories.filter(
		(category) =>
			matchesSearch(search, category.namePt, category.nameEn, category.slug) &&
			(!activeFilter || (activeFilter === "active") === category.isActive)
	);

	function openCreate() {
		setEditing(null);
		setActive(true);
		setError("");
		setOpen(true);
	}

	function openEdit(category: CategoryRow) {
		setEditing(category);
		setActive(category.isActive);
		setError("");
		setOpen(true);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		const form = new FormData(event.currentTarget);
		const input: CategoryFormInput = {
			slug: String(form.get("slug") ?? ""),
			namePt: String(form.get("namePt") ?? ""),
			nameEn: String(form.get("nameEn") ?? ""),
			descriptionPt: String(form.get("descriptionPt") ?? ""),
			descriptionEn: String(form.get("descriptionEn") ?? ""),
			iconUrl: String(form.get("iconUrl") ?? ""),
			imageUrl: String(form.get("imageUrl") ?? ""),
			sortOrder: Number(form.get("sortOrder") ?? 0),
			isActive: active,
		};

		startTransition(async () => {
			const result = editing
				? await updateCategory(editing.id, input)
				: await createCategory(input);

			if (!result.ok) {
				setError(result.error ?? "Erro ao guardar.");
				return;
			}

			setOpen(false);
			router.refresh();
		});
	}

	function handleToggleRequest(category: CategoryRow) {
		if (category.isActive) {
			setDeactivateTarget(category);
			return;
		}
		startTransition(async () => {
			await toggleCategoryActive(category.id, true);
			router.refresh();
		});
	}

	function confirmDeactivate() {
		if (!deactivateTarget) return;
		const { id } = deactivateTarget;
		startTransition(async () => {
			await toggleCategoryActive(id, false);
			setDeactivateTarget(null);
			router.refresh();
		});
	}

	function confirmDelete() {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		startTransition(async () => {
			await deleteCategory(id);
			setDeleteTarget(null);
			router.refresh();
		});
	}

	return (
		<div className="admin-form-stack">
			<AdminFilterBar
				shown={filtered.length}
				total={categories.length}
				hasFilters={Boolean(search || activeFilter)}
				onClear={() => {
					setSearch("");
					setActiveFilter("");
				}}
				actions={
					<button
						type="button"
						className="admin-btn admin-btn-primary"
						onClick={openCreate}
					>
						<i className="ph ph-plus" aria-hidden />
						Nova categoria
					</button>
				}
			>
				<AdminFilterSearch
					value={search}
					onChange={setSearch}
					placeholder="Pesquisar por nome ou slug"
				/>
				<AdminFilterSelect
					label="Estado"
					value={activeFilter}
					onChange={setActiveFilter}
					options={activeOptions}
				/>
			</AdminFilterBar>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Nome</th>
							<th>Slug</th>
							<th>Ordem</th>
							<th>Estado</th>
							<th className="text-end">Ações</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? <AdminFilterEmptyRow colSpan={5} /> : null}
						{filtered.map((category) => (
							<tr key={category.id}>
								<td>
									<div>
										<p className="mb-0 fw-medium">{category.namePt}</p>
										<p className="mb-0 small text-muted">{category.nameEn}</p>
									</div>
								</td>
								<td>{category.slug}</td>
								<td>{category.sortOrder}</td>
								<td>
									<AdminBadge variant={category.isActive ? "success" : "muted"}>
										{category.isActive ? "Ativa" : "Inativa"}
									</AdminBadge>
								</td>
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
										<AdminDropdownItem onSelect={() => openEdit(category)}>
											<i className="ph ph-pencil-simple" aria-hidden />
											Editar
										</AdminDropdownItem>
										<AdminDropdownItem
											onSelect={() => handleToggleRequest(category)}
										>
											<i className="ph ph-power" aria-hidden />
											{category.isActive ? "Desativar" : "Ativar"}
										</AdminDropdownItem>
										<AdminDropdownSeparator />
										<AdminDropdownItem
											danger
											onSelect={() => setDeleteTarget(category)}
										>
											<i className="ph ph-trash" aria-hidden />
											Eliminar
										</AdminDropdownItem>
									</AdminDropdown>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<AdminModal
				open={open}
				onClose={() => setOpen(false)}
				title={editing ? "Editar categoria" : "Nova categoria"}
				size="xl"
				footer={
					<>
						<button
							type="button"
							className="admin-btn admin-btn-outline"
							onClick={() => setOpen(false)}
						>
							Cancelar
						</button>
						<button
							type="submit"
							form="category-form"
							className="admin-btn admin-btn-primary"
							disabled={pending}
						>
							{editing ? "Guardar" : "Criar"}
						</button>
					</>
				}
			>
				<form id="category-form" onSubmit={handleSubmit} className="admin-form-stack">
					<div className="admin-form-grid-3">
						<div>
							<label htmlFor="slug" className="admin-label">
								Slug
							</label>
							<input
								id="slug"
								name="slug"
								defaultValue={editing?.slug}
								placeholder="ex: desenvolvimento-web"
								required
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="namePt" className="admin-label">
								Nome (PT)
							</label>
							<input
								id="namePt"
								name="namePt"
								defaultValue={editing?.namePt}
								required
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="nameEn" className="admin-label">
								Nome (EN)
							</label>
							<input
								id="nameEn"
								name="nameEn"
								defaultValue={editing?.nameEn}
								required
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="sortOrder" className="admin-label">
								Ordem
							</label>
							<input
								id="sortOrder"
								name="sortOrder"
								type="number"
								defaultValue={editing?.sortOrder ?? 0}
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="iconUrl" className="admin-label">
								URL do ícone
							</label>
							<input
								id="iconUrl"
								name="iconUrl"
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="imageUrl" className="admin-label">
								URL da imagem
							</label>
							<input
								id="imageUrl"
								name="imageUrl"
								className="admin-input form-control"
							/>
						</div>
						<div className="admin-form-grid-span-all">
							<label htmlFor="descriptionPt" className="admin-label">
								Descrição (PT)
							</label>
							<textarea
								id="descriptionPt"
								name="descriptionPt"
								rows={2}
								className="admin-input form-control"
							/>
						</div>
						<div className="admin-form-grid-span-all">
							<label htmlFor="descriptionEn" className="admin-label">
								Descrição (EN)
							</label>
							<textarea
								id="descriptionEn"
								name="descriptionEn"
								rows={2}
								className="admin-input form-control"
							/>
						</div>
					</div>

					<label className="admin-check-row">
						<input
							className="form-check-input"
							type="checkbox"
							checked={active}
							onChange={(event) => setActive(event.target.checked)}
						/>
						Ativa
					</label>

					{error ? <p className="admin-alert-error mb-0">{error}</p> : null}
				</form>
			</AdminModal>

			<AdminModal
				open={deactivateTarget !== null}
				onClose={() => setDeactivateTarget(null)}
				title="Desativar categoria?"
				footer={
					<>
						<button
							type="button"
							className="admin-btn admin-btn-outline"
							onClick={() => setDeactivateTarget(null)}
							disabled={pending}
						>
							Cancelar
						</button>
						<button
							type="button"
							className="admin-btn admin-btn-danger"
							onClick={confirmDeactivate}
							disabled={pending}
						>
							{pending ? "A desativar..." : "Desativar"}
						</button>
					</>
				}
			>
				<p className="mb-0">
					A categoria &quot;{deactivateTarget?.namePt}&quot; deixará de estar
					disponível no site.
				</p>
			</AdminModal>

			<AdminModal
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				title="Eliminar categoria?"
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
					Esta ação não pode ser desfeita. Eliminar a categoria &quot;
					{deleteTarget?.namePt}&quot;?
				</p>
			</AdminModal>
		</div>
	);
}

"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	createInstructor,
	deleteInstructor,
	updateInstructor,
	type InstructorFormInput,
} from "@/app/actions/admin/instructors";
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

const featuredOptions = [
	{ value: "yes", label: "Em destaque" },
	{ value: "no", label: "Sem destaque" },
];

type InstructorRow = {
	id: string;
	slug: string;
	name: string;
	headlinePt: string;
	headlineEn: string;
	isFeatured: boolean;
};

export default function InstructorsPanel({
	instructors,
}: {
	instructors: InstructorRow[];
}) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<InstructorRow | null>(null);
	const [featured, setFeatured] = useState(false);
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<InstructorRow | null>(null);
	const [search, setSearch] = useState("");
	const [featuredFilter, setFeaturedFilter] = useState("");

	const filtered = instructors.filter(
		(instructor) =>
			matchesSearch(
				search,
				instructor.name,
				instructor.slug,
				instructor.headlinePt,
				instructor.headlineEn
			) &&
			(!featuredFilter ||
				(featuredFilter === "yes") === instructor.isFeatured)
	);

	function openCreate() {
		setEditing(null);
		setFeatured(false);
		setError("");
		setOpen(true);
	}

	function openEdit(instructor: InstructorRow) {
		setEditing(instructor);
		setFeatured(instructor.isFeatured);
		setError("");
		setOpen(true);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		const form = new FormData(event.currentTarget);
		const input: InstructorFormInput = {
			slug: String(form.get("slug") ?? ""),
			name: String(form.get("name") ?? ""),
			headlinePt: String(form.get("headlinePt") ?? ""),
			headlineEn: String(form.get("headlineEn") ?? ""),
			bioPt: String(form.get("bioPt") ?? ""),
			bioEn: String(form.get("bioEn") ?? ""),
			photoUrl: String(form.get("photoUrl") ?? ""),
			isFeatured: featured,
		};

		startTransition(async () => {
			const result = editing
				? await updateInstructor(editing.id, input)
				: await createInstructor(input);

			if (!result.ok) {
				setError(result.error ?? "Erro ao guardar.");
				return;
			}

			setOpen(false);
			router.refresh();
		});
	}

	function confirmDelete() {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		startTransition(async () => {
			await deleteInstructor(id);
			setDeleteTarget(null);
			router.refresh();
		});
	}

	return (
		<div className="admin-form-stack">
			<AdminFilterBar
				shown={filtered.length}
				total={instructors.length}
				hasFilters={Boolean(search || featuredFilter)}
				onClear={() => {
					setSearch("");
					setFeaturedFilter("");
				}}
				actions={
					<button
						type="button"
						className="admin-btn admin-btn-primary"
						onClick={openCreate}
					>
						<i className="ph ph-plus" aria-hidden />
						Novo instrutor
					</button>
				}
			>
				<AdminFilterSearch
					value={search}
					onChange={setSearch}
					placeholder="Pesquisar por nome, slug ou headline"
				/>
				<AdminFilterSelect
					label="Destaque"
					value={featuredFilter}
					onChange={setFeaturedFilter}
					options={featuredOptions}
				/>
			</AdminFilterBar>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Nome</th>
							<th>Slug</th>
							<th>Headline</th>
							<th>Destaque</th>
							<th className="text-end">Ações</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? <AdminFilterEmptyRow colSpan={5} /> : null}
						{filtered.map((instructor) => (
							<tr key={instructor.id}>
								<td className="fw-medium">{instructor.name}</td>
								<td>{instructor.slug}</td>
								<td>{instructor.headlinePt}</td>
								<td>
									<AdminBadge variant={instructor.isFeatured ? "success" : "muted"}>
										{instructor.isFeatured ? "Sim" : "Não"}
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
										<AdminDropdownItem onSelect={() => openEdit(instructor)}>
											<i className="ph ph-pencil-simple" aria-hidden />
											Editar
										</AdminDropdownItem>
										<AdminDropdownSeparator />
										<AdminDropdownItem
											danger
											onSelect={() => setDeleteTarget(instructor)}
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
				title={editing ? "Editar instrutor" : "Novo instrutor"}
				size="lg"
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
							form="instructor-form"
							className="admin-btn admin-btn-primary"
							disabled={pending}
						>
							{editing ? "Guardar" : "Criar"}
						</button>
					</>
				}
			>
				<form id="instructor-form" onSubmit={handleSubmit} className="admin-form-stack">
					<div className="admin-form-grid">
						<div>
							<label htmlFor="slug" className="admin-label">
								Slug
							</label>
							<input
								id="slug"
								name="slug"
								defaultValue={editing?.slug}
								required
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="name" className="admin-label">
								Nome
							</label>
							<input
								id="name"
								name="name"
								defaultValue={editing?.name}
								required
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="headlinePt" className="admin-label">
								Headline (PT)
							</label>
							<input
								id="headlinePt"
								name="headlinePt"
								defaultValue={editing?.headlinePt}
								required
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="headlineEn" className="admin-label">
								Headline (EN)
							</label>
							<input
								id="headlineEn"
								name="headlineEn"
								defaultValue={editing?.headlineEn}
								required
								className="admin-input form-control"
							/>
						</div>
						<div className="admin-form-grid-span-2">
							<label htmlFor="photoUrl" className="admin-label">
								URL da foto
							</label>
							<input
								id="photoUrl"
								name="photoUrl"
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="bioPt" className="admin-label">
								Bio (PT)
							</label>
							<textarea
								id="bioPt"
								name="bioPt"
								rows={2}
								className="admin-input form-control"
							/>
						</div>
						<div>
							<label htmlFor="bioEn" className="admin-label">
								Bio (EN)
							</label>
							<textarea
								id="bioEn"
								name="bioEn"
								rows={2}
								className="admin-input form-control"
							/>
						</div>
					</div>

					<label className="admin-check-row">
						<input
							className="form-check-input"
							type="checkbox"
							checked={featured}
							onChange={(event) => setFeatured(event.target.checked)}
						/>
						Destaque
					</label>

					{error ? <p className="admin-alert-error mb-0">{error}</p> : null}
				</form>
			</AdminModal>

			<AdminModal
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				title="Eliminar instrutor?"
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
					Esta ação não pode ser desfeita. Eliminar o instrutor &quot;
					{deleteTarget?.name}&quot;?
				</p>
			</AdminModal>
		</div>
	);
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteCourse, updateCourseStatus } from "@/app/actions/admin/courses";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import AdminModal from "@/app/backoffice/components/admin-modal";
import {
	AdminFilterBar,
	AdminFilterDateRange,
	AdminFilterEmptyRow,
	AdminFilterSearch,
	AdminFilterSelect,
	emptyDateRange,
	hasDateRange,
	inDateRange,
	matchesSearch,
} from "@/app/backoffice/components/admin-filters";
import {
	AdminDropdown,
	AdminDropdownItem,
	AdminDropdownSeparator,
} from "@/app/backoffice/components/admin-dropdown";
import type { CourseStatus } from "@/db/schema";
import { formatPrice } from "@/lib/i18n-content";

type CourseRow = {
	id: string;
	slug: string;
	titlePt: string;
	status: CourseStatus;
	price: string;
	currency: string;
	instructorName: string | null;
	categories: string[];
	seats: number | null;
	enrolled: number;
	createdAt: Date;
};

const statusVariant: Record<
	CourseStatus,
	"success" | "warning" | "muted"
> = {
	published: "success",
	draft: "warning",
	archived: "muted",
};

const statusLabel: Record<CourseStatus, string> = {
	published: "Publicado",
	draft: "Rascunho",
	archived: "Arquivado",
};

const statusOptions = (Object.keys(statusLabel) as CourseStatus[]).map(
	(value) => ({ value, label: statusLabel[value] })
);

const seatsOptions = [
	{ value: "available", label: "Com vagas" },
	{ value: "full", label: "Esgotados" },
	{ value: "unlimited", label: "Sem limite" },
];

function seatsState(course: CourseRow) {
	if (course.seats === null) return "unlimited";
	return course.enrolled >= course.seats ? "full" : "available";
}

function uniqueOptions(values: string[]) {
	return [...new Set(values)]
		.sort((a, b) => a.localeCompare(b, "pt"))
		.map((value) => ({ value, label: value }));
}

function enrolledLabel(count: number) {
	return count === 1 ? "1 inscrito" : `${count} inscritos`;
}

function SeatsCell({
	seats,
	enrolled,
}: {
	seats: number | null;
	enrolled: number;
}) {
	if (seats === null) {
		return (
			<div>
				<p className="mb-0">{enrolledLabel(enrolled)}</p>
				<p className="mb-0 small text-muted">Sem limite</p>
			</div>
		);
	}

	const remaining = Math.max(0, seats - enrolled);
	if (remaining === 0) {
		return (
			<div>
				<AdminBadge variant="danger">Esgotado</AdminBadge>
				<p className="mb-0 small text-muted mt-1">
					{enrolled} / {seats}
				</p>
			</div>
		);
	}

	return (
		<div>
			<p className="mb-0">{remaining} disponíveis</p>
			<p className="mb-0 small text-muted">
				{enrolled} / {seats}
			</p>
		</div>
	);
}

export default function CoursesTable({
	courses,
	initialStatus = "",
}: {
	courses: CourseRow[];
	initialStatus?: string;
}) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState(() =>
		statusOptions.some((option) => option.value === initialStatus)
			? initialStatus
			: ""
	);
	const [category, setCategory] = useState("");
	const [instructor, setInstructor] = useState("");
	const [seats, setSeats] = useState("");
	const [created, setCreated] = useState(emptyDateRange);

	const categoryOptions = useMemo(
		() => uniqueOptions(courses.flatMap((course) => course.categories)),
		[courses]
	);
	const instructorOptions = useMemo(
		() =>
			uniqueOptions(
				courses.flatMap((course) =>
					course.instructorName ? [course.instructorName] : []
				)
			),
		[courses]
	);

	const filtered = courses.filter(
		(course) =>
			matchesSearch(search, course.titlePt, course.slug) &&
			(!status || course.status === status) &&
			(!category || course.categories.includes(category)) &&
			(!instructor || course.instructorName === instructor) &&
			(!seats || seatsState(course) === seats) &&
			inDateRange(course.createdAt, created)
	);
	const hasFilters =
		Boolean(search || status || category || instructor || seats) ||
		hasDateRange(created);

	function clearFilters() {
		setSearch("");
		setStatus("");
		setCategory("");
		setInstructor("");
		setSeats("");
		setCreated(emptyDateRange);
	}
	const [pending, startTransition] = useTransition();
	const [unpublishTarget, setUnpublishTarget] = useState<CourseRow | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<CourseRow | null>(null);

	function handleStatus(id: string, status: CourseStatus) {
		startTransition(async () => {
			await updateCourseStatus(id, status);
			router.refresh();
		});
	}

	function confirmUnpublish() {
		if (!unpublishTarget) return;
		const { id } = unpublishTarget;
		startTransition(async () => {
			await updateCourseStatus(id, "draft");
			setUnpublishTarget(null);
			router.refresh();
		});
	}

	function confirmDelete() {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		startTransition(async () => {
			await deleteCourse(id);
			setDeleteTarget(null);
			router.refresh();
		});
	}

	if (!courses.length) {
		return (
			<div className="admin-empty">
				Nenhum curso encontrado. Crie o primeiro curso.
			</div>
		);
	}

	return (
		<>
		<AdminFilterBar
			shown={filtered.length}
			total={courses.length}
			hasFilters={hasFilters}
			onClear={clearFilters}
		>
			<AdminFilterSearch
				value={search}
				onChange={setSearch}
				placeholder="Pesquisar por título ou slug"
			/>
			<AdminFilterSelect
				label="Estado"
				value={status}
				onChange={setStatus}
				options={statusOptions}
			/>
			<AdminFilterSelect
				label="Categoria"
				value={category}
				onChange={setCategory}
				options={categoryOptions}
				allLabel="Todas"
			/>
			<AdminFilterSelect
				label="Instrutor"
				value={instructor}
				onChange={setInstructor}
				options={instructorOptions}
			/>
			<AdminFilterSelect
				label="Vagas"
				value={seats}
				onChange={setSeats}
				options={seatsOptions}
				allLabel="Todas"
			/>
			<AdminFilterDateRange
				label="Data de criação"
				value={created}
				onChange={setCreated}
			/>
		</AdminFilterBar>
		<div className="admin-table-wrap">
			<table className="admin-table">
				<thead>
					<tr>
						<th>Título</th>
						<th>Estado</th>
						<th>Preço</th>
						<th>Vagas</th>
						<th>Instrutor</th>
						<th>Categorias</th>
						<th className="text-end">Ações</th>
					</tr>
				</thead>
				<tbody>
					{filtered.length === 0 ? <AdminFilterEmptyRow colSpan={7} /> : null}
					{filtered.map((course) => (
						<tr key={course.id}>
							<td>
								<div>
									<p className="mb-0 fw-medium">{course.titlePt}</p>
									<p className="mb-0 small text-muted">{course.slug}</p>
								</div>
							</td>
							<td>
								<AdminBadge variant={statusVariant[course.status]}>
									{statusLabel[course.status]}
								</AdminBadge>
							</td>
							<td>{formatPrice(course.price, course.currency)}</td>
							<td>
								<SeatsCell seats={course.seats} enrolled={course.enrolled} />
							</td>
							<td>{course.instructorName ?? "—"}</td>
							<td>
								<span className="small">
									{course.categories.join(", ") || "—"}
								</span>
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
									<AdminDropdownItem href={`/backoffice/cursos/${course.id}`}>
										<i className="ph ph-pencil-simple" aria-hidden />
										Editar
									</AdminDropdownItem>
									<AdminDropdownItem
										href={`/backoffice/cursos/${course.id}/inscritos`}
									>
										<i className="ph ph-users" aria-hidden />
										Ver inscritos
									</AdminDropdownItem>
									{course.status !== "published" ? (
										<AdminDropdownItem
											onSelect={() => handleStatus(course.id, "published")}
										>
											<i className="ph ph-paper-plane-tilt" aria-hidden />
											Publicar
										</AdminDropdownItem>
									) : (
										<AdminDropdownItem
											onSelect={() => setUnpublishTarget(course)}
										>
											<i className="ph ph-arrow-u-up-left" aria-hidden />
											Despublicar
										</AdminDropdownItem>
									)}
									<AdminDropdownSeparator />
									<AdminDropdownItem
										danger
										onSelect={() => setDeleteTarget(course)}
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
			open={unpublishTarget !== null}
			onClose={() => setUnpublishTarget(null)}
			title="Despublicar curso?"
			footer={
				<>
					<button
						type="button"
						className="admin-btn admin-btn-outline"
						onClick={() => setUnpublishTarget(null)}
						disabled={pending}
					>
						Cancelar
					</button>
					<button
						type="button"
						className="admin-btn admin-btn-danger"
						onClick={confirmUnpublish}
						disabled={pending}
					>
						{pending ? "A despublicar..." : "Despublicar"}
					</button>
				</>
			}
		>
			<p className="mb-0">
				O curso &quot;{unpublishTarget?.titlePt}&quot; deixará de estar visível
				no site.
			</p>
		</AdminModal>

		<AdminModal
			open={deleteTarget !== null}
			onClose={() => setDeleteTarget(null)}
			title="Eliminar curso?"
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
				Esta ação não pode ser desfeita. Eliminar o curso &quot;
				{deleteTarget?.titlePt}&quot;?
			</p>
		</AdminModal>
		</>
	);
}

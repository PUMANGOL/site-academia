"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import {
	createCourse,
	updateCourse,
	type CourseFormInput,
} from "@/app/actions/admin/courses";
import type { CourseModality, CourseStatus, SkillLevel } from "@/db/schema";

type Option = { id: string; label: string };

type CourseFormProps = {
	mode: "create" | "edit";
	courseId?: string;
	initial?: Partial<CourseFormInput>;
	enrolledCount?: number;
	instructors: Option[];
	categories: Option[];
};

const skillLevels: { value: SkillLevel; label: string }[] = [
	{ value: "beginner", label: "Iniciante" },
	{ value: "intermediate", label: "Intermédio" },
	{ value: "advanced", label: "Avançado" },
];

const modalities: { value: CourseModality; label: string }[] = [
	{ value: "in_person", label: "Presencial" },
	{ value: "online", label: "Online" },
];

const tabs = [
	{ id: "general", label: "Informação geral" },
	{ id: "content", label: "Descrição e objectivos" },
	{ id: "schedule", label: "Realização" },
	{ id: "people", label: "Formadores e categorias" },
	{ id: "publish", label: "Publicação" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const statuses: { value: CourseStatus; label: string }[] = [
	{ value: "draft", label: "Rascunho" },
	{ value: "published", label: "Publicado" },
	{ value: "archived", label: "Arquivado" },
];

export default function CourseForm({
	mode,
	courseId,
	initial,
	enrolledCount,
	instructors,
	categories,
}: CourseFormProps) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [activeTab, setActiveTab] = useState<TabId>("general");
	const activeTabRef = useRef<TabId>("general");

	function showTab(tab: TabId) {
		activeTabRef.current = tab;
		setActiveTab(tab);
	}

	function fail(message: string, tab: TabId) {
		setError(message);
		setPending(false);
		showTab(tab);
	}

	// Campo obrigatório vazio numa tab escondida: o browser não consegue mostrar o aviso,
	// por isso abrimos a tab do campo e voltamos a pedir a validação.
	function onInvalidCapture(event: FormEvent<HTMLFormElement>) {
		const field = event.target as HTMLInputElement;
		const tab = field.closest<HTMLElement>("[data-tab]")?.dataset.tab as TabId | undefined;
		if (!tab || tab === activeTabRef.current) return;
		showTab(tab);
		requestAnimationFrame(() => field.reportValidity());
	}
	const [selectedCategories, setSelectedCategories] = useState<string[]>(
		initial?.categoryIds ?? []
	);

	const [selectedInstructors, setSelectedInstructors] = useState<string[]>(
		initial?.instructorIds ?? []
	);

	function toggle(setter: typeof setSelectedCategories, id: string) {
		setter((current) =>
			current.includes(id)
				? current.filter((value) => value !== id)
				: [...current, id]
		);
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setPending(true);

		const form = new FormData(event.currentTarget);
		const seatsRaw = String(form.get("seats") ?? "").trim();
		if (seatsRaw && !/^\d+$/.test(seatsRaw)) {
			fail("Indique um número inteiro de vagas, ou deixe o campo em branco.", "schedule");
			return;
		}

		const durationRaw = String(form.get("durationHours") ?? "").trim().replace(",", ".");
		if (durationRaw && !/^\d+(\.\d+)?$/.test(durationRaw)) {
			fail("Indique a duração em horas (ex.: 16 ou 1.5), ou deixe o campo em branco.", "schedule");
			return;
		}

		const startDate = String(form.get("startDate") ?? "") || null;
		const endDate = String(form.get("endDate") ?? "") || null;
		if (startDate && endDate && endDate < startDate) {
			fail("A data de fim não pode ser anterior à data de início.", "schedule");
			return;
		}

		const input: CourseFormInput = {
			slug: String(form.get("slug") ?? ""),
			titlePt: String(form.get("titlePt") ?? ""),
			titleEn: String(form.get("titleEn") ?? ""),
			excerptPt: String(form.get("excerptPt") ?? ""),
			excerptEn: String(form.get("excerptEn") ?? ""),
			descriptionPt: String(form.get("descriptionPt") ?? ""),
			descriptionEn: String(form.get("descriptionEn") ?? ""),
			objectivesPt: String(form.get("objectivesPt") ?? ""),
			objectivesEn: String(form.get("objectivesEn") ?? ""),
			imageUrl: String(form.get("imageUrl") ?? ""),
			price: String(form.get("price") ?? "0"),
			skillLevel: String(form.get("skillLevel") ?? "beginner") as SkillLevel,
			status: String(form.get("status") ?? "draft") as CourseStatus,
			instructorIds: selectedInstructors,
			modality: String(form.get("modality") ?? "in_person") as CourseModality,
			durationHours: durationRaw === "" ? null : Number(durationRaw),
			startDate,
			endDate,
			categoryIds: selectedCategories,
			isFeatured: form.get("isFeatured") === "1",
			isFree: form.get("isFree") === "1",
			seats: seatsRaw === "" ? null : Number.parseInt(seatsRaw, 10),
		};

		const result =
			mode === "create"
				? await createCourse(input)
				: await updateCourse(courseId!, input);

		setPending(false);

		if (!result.ok) {
			setError(result.error ?? "Erro ao guardar.");
			return;
		}

		router.push("/backoffice/cursos");
		router.refresh();
	}

	return (
		<form
			onSubmit={onSubmit}
			onInvalidCapture={onInvalidCapture}
			className="admin-form-panel admin-form-stack"
		>
			<div className="admin-tabs admin-form-tabs" role="tablist">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={activeTab === tab.id}
						className={`admin-tab ${activeTab === tab.id ? "is-active" : ""}`}
						onClick={() => showTab(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div data-tab="general" role="tabpanel" hidden={activeTab !== "general"}>
				<div className="admin-form-grid">
					<Field label="Slug" name="slug" defaultValue={initial?.slug} required />
					<Field
						label="URL da imagem"
						name="imageUrl"
						defaultValue={initial?.imageUrl}
						required
					/>
					<Field
						label="Título (PT)"
						name="titlePt"
						defaultValue={initial?.titlePt}
						required
					/>
					<Field
						label="Título (EN)"
						name="titleEn"
						defaultValue={initial?.titleEn}
						required
					/>
					<Field
						label="Resumo (PT)"
						name="excerptPt"
						defaultValue={initial?.excerptPt}
						hint="Texto curto usado nos cartões do catálogo."
						multiline
						required
					/>
					<Field
						label="Resumo (EN)"
						name="excerptEn"
						defaultValue={initial?.excerptEn}
						multiline
						required
					/>
				</div>
			</div>

			<div data-tab="content" role="tabpanel" hidden={activeTab !== "content"}>
				<div className="admin-form-grid">
					<Field
						label="Descrição (PT)"
						name="descriptionPt"
						defaultValue={initial?.descriptionPt}
						hint="Apresentada na página do curso. Separe parágrafos com uma linha em branco."
						multiline
						rows={6}
					/>
					<Field
						label="Descrição (EN)"
						name="descriptionEn"
						defaultValue={initial?.descriptionEn}
						multiline
						rows={6}
					/>
					<Field
						label="Objectivos (PT)"
						name="objectivesPt"
						defaultValue={initial?.objectivesPt}
						hint="Um objectivo por linha."
						multiline
						rows={5}
					/>
					<Field
						label="Objectivos (EN)"
						name="objectivesEn"
						defaultValue={initial?.objectivesEn}
						multiline
						rows={5}
					/>
				</div>
			</div>

			<div data-tab="schedule" role="tabpanel" hidden={activeTab !== "schedule"}>
				<div className="admin-form-grid">
					<div>
						<label className="admin-label">Modalidade</label>
						<select
							name="modality"
							defaultValue={initial?.modality ?? "in_person"}
							className="admin-input form-select"
						>
							{modalities.map((modality) => (
								<option key={modality.value} value={modality.value}>
									{modality.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="durationHours" className="admin-label">
							Duração (horas)
						</label>
						<input
							id="durationHours"
							name="durationHours"
							type="number"
							min={0}
							step={0.5}
							placeholder="Ex.: 16"
							defaultValue={
								initial?.durationHours == null ? "" : String(initial.durationHours)
							}
							className="admin-input form-control"
						/>
					</div>
					<Field
						label="Data de início"
						name="startDate"
						type="date"
						defaultValue={initial?.startDate ?? undefined}
					/>
					<Field
						label="Data de fim"
						name="endDate"
						type="date"
						defaultValue={initial?.endDate ?? undefined}
					/>
					<div>
						<label htmlFor="seats" className="admin-label">
							Vagas
						</label>
						<input
							id="seats"
							name="seats"
							type="number"
							min={0}
							step={1}
							placeholder="Sem limite"
							defaultValue={
								initial?.seats == null ? "" : String(initial.seats)
							}
							className="admin-input form-control"
						/>
						{enrolledCount !== undefined ? (
							<p className="admin-help">
								{seatsSummary(initial?.seats ?? null, enrolledCount)}
							</p>
						) : null}
					</div>
					<div>
						<label className="admin-label">Nível</label>
						<select
							name="skillLevel"
							defaultValue={initial?.skillLevel ?? "beginner"}
							className="admin-input form-select"
						>
							{skillLevels.map((level) => (
								<option key={level.value} value={level.value}>
									{level.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<div
				data-tab="people"
				role="tabpanel"
				hidden={activeTab !== "people"}
				className="admin-form-stack"
			>
				<div>
					<p className="admin-label">Formadores</p>
					{instructors.length === 0 ? (
						<p className="admin-help">
							Ainda não há formadores. Adicione-os em{" "}
							<Link href="/backoffice/instrutores">Instrutores</Link>.
						</p>
					) : (
						<div className="admin-check-list">
							{instructors.map((instructor) => (
								<label key={instructor.id} className="admin-check-chip">
									<input
										className="form-check-input"
										type="checkbox"
										checked={selectedInstructors.includes(instructor.id)}
										onChange={() => toggle(setSelectedInstructors, instructor.id)}
									/>
									{instructor.label}
								</label>
							))}
						</div>
					)}
					<p className="admin-help">
						O primeiro formador seleccionado aparece como formador principal.
					</p>
				</div>

				<div>
					<p className="admin-label">Categorias</p>
					<div className="admin-check-list">
						{categories.map((category) => (
							<label key={category.id} className="admin-check-chip">
								<input
									className="form-check-input"
									type="checkbox"
									checked={selectedCategories.includes(category.id)}
									onChange={() => toggle(setSelectedCategories, category.id)}
								/>
								{category.label}
							</label>
						))}
					</div>
				</div>
			</div>

			<div
				data-tab="publish"
				role="tabpanel"
				hidden={activeTab !== "publish"}
				className="admin-form-stack"
			>
				<div className="admin-form-grid">
					<Field
						label="Preço (AOA)"
						name="price"
						type="number"
						defaultValue={initial?.price ?? "0"}
						required
					/>
					<div>
						<label className="admin-label">Estado</label>
						<select
							name="status"
							defaultValue={initial?.status ?? "draft"}
							className="admin-input form-select"
						>
							{statuses.map((status) => (
								<option key={status.value} value={status.value}>
									{status.label}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="d-flex flex-wrap gap-3">
					<label className="admin-check-row">
						<input
							className="form-check-input"
							type="checkbox"
							name="isFeatured"
							value="1"
							defaultChecked={initial?.isFeatured}
						/>
						Destaque na homepage
					</label>
					<label className="admin-check-row">
						<input
							className="form-check-input"
							type="checkbox"
							name="isFree"
							value="1"
							defaultChecked={initial?.isFree}
						/>
						Gratuito
					</label>
				</div>
			</div>

			{error ? <p className="admin-alert-error mb-0">{error}</p> : null}

			<div className="d-flex gap-3">
				<button
					type="submit"
					className="admin-btn admin-btn-primary"
					disabled={pending}
				>
					{pending ? "A guardar..." : mode === "create" ? "Criar curso" : "Guardar"}
				</button>
				<Link href="/backoffice/cursos" className="admin-btn admin-btn-outline">
					Cancelar
				</Link>
			</div>
		</form>
	);
}

function seatsSummary(seats: number | null, enrolled: number) {
	const enrolledLabel = enrolled === 1 ? "1 inscrito" : `${enrolled} inscritos`;
	if (seats == null) {
		return `${enrolledLabel}. Sem limite de vagas.`;
	}
	const remaining = Math.max(0, seats - enrolled);
	if (remaining === 0) {
		return `${enrolledLabel} de ${seats}. Esgotado — não aparece no site.`;
	}
	return `${enrolledLabel} de ${seats}. ${remaining} disponíveis.`;
}

function Field({
	label,
	name,
	defaultValue,
	required,
	type = "text",
	multiline,
	rows = 3,
	hint,
}: {
	label: string;
	name: string;
	defaultValue?: string;
	required?: boolean;
	type?: string;
	multiline?: boolean;
	rows?: number;
	hint?: string;
}) {
	return (
		<div>
			<label htmlFor={name} className="admin-label">
				{label}
			</label>
			{multiline ? (
				<textarea
					id={name}
					name={name}
					defaultValue={defaultValue}
					required={required}
					rows={rows}
					className="admin-input form-control"
				/>
			) : (
				<input
					id={name}
					name={name}
					type={type}
					defaultValue={defaultValue}
					required={required}
					className="admin-input form-control"
				/>
			)}
			{hint ? <p className="admin-help">{hint}</p> : null}
		</div>
	);
}

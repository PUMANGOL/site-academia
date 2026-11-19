"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import {
	createPost,
	updatePost,
	type PostFormInput,
} from "@/app/actions/admin/posts";
import MediaField from "@/app/backoffice/components/media-field";
import RichTextEditor from "@/app/backoffice/components/rich-text-editor";
import type { ContentStatus, RichTextDoc } from "@/db/schema";
import { slugify } from "@/lib/content";

const tabs = [
	{ id: "general", label: "Informação geral" },
	{ id: "bodyPt", label: "Conteúdo (PT)" },
	{ id: "bodyEn", label: "Conteúdo (EN)" },
	{ id: "publish", label: "Publicação" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const statuses: { value: ContentStatus; label: string }[] = [
	{ value: "draft", label: "Rascunho" },
	{ value: "published", label: "Publicado" },
	{ value: "archived", label: "Arquivado" },
];

export default function PostForm({
	mode,
	postId,
	initial,
}: {
	mode: "create" | "edit";
	postId?: string;
	initial?: Partial<PostFormInput>;
}) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [activeTab, setActiveTab] = useState<TabId>("general");
	const activeTabRef = useRef<TabId>("general");
	const [slug, setSlug] = useState(initial?.slug ?? "");
	const [slugTouched, setSlugTouched] = useState(mode === "edit");
	const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
	const [bodyPt, setBodyPt] = useState<RichTextDoc | null>(initial?.bodyPt ?? null);
	const [bodyEn, setBodyEn] = useState<RichTextDoc | null>(initial?.bodyEn ?? null);

	function showTab(tab: TabId) {
		activeTabRef.current = tab;
		setActiveTab(tab);
	}

	// Mesmo comportamento do formulário de cursos: abre a tab do campo obrigatório em falta.
	function onInvalidCapture(event: FormEvent<HTMLFormElement>) {
		const field = event.target as HTMLInputElement;
		const tab = field.closest<HTMLElement>("[data-tab]")?.dataset.tab as TabId | undefined;
		if (!tab || tab === activeTabRef.current) return;
		showTab(tab);
		requestAnimationFrame(() => field.reportValidity());
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setPending(true);

		const form = new FormData(event.currentTarget);
		const input: PostFormInput = {
			slug,
			titlePt: String(form.get("titlePt") ?? ""),
			titleEn: String(form.get("titleEn") ?? ""),
			excerptPt: String(form.get("excerptPt") ?? ""),
			excerptEn: String(form.get("excerptEn") ?? ""),
			categoryPt: String(form.get("categoryPt") ?? ""),
			categoryEn: String(form.get("categoryEn") ?? ""),
			bodyPt,
			bodyEn,
			coverImageUrl,
			status: String(form.get("status") ?? "draft") as ContentStatus,
			isFeatured: form.get("isFeatured") === "1",
		};

		const result =
			mode === "create" ? await createPost(input) : await updatePost(postId!, input);

		setPending(false);
		if (!result.ok) {
			setError(result.error ?? "Erro ao guardar.");
			return;
		}

		router.push("/backoffice/noticias");
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
					<div>
						<label htmlFor="titlePt" className="admin-label">
							Título (PT)
						</label>
						<input
							id="titlePt"
							name="titlePt"
							defaultValue={initial?.titlePt}
							required
							className="admin-input form-control"
							onChange={(event) => {
								if (!slugTouched) setSlug(slugify(event.target.value));
							}}
						/>
					</div>
					<Field label="Título (EN)" name="titleEn" defaultValue={initial?.titleEn} />
					<div>
						<label htmlFor="slug" className="admin-label">
							Slug
						</label>
						<input
							id="slug"
							name="slug"
							value={slug}
							required
							pattern="[a-z0-9]+(-[a-z0-9]+)*"
							className="admin-input form-control"
							onChange={(event) => {
								setSlugTouched(true);
								setSlug(event.target.value);
							}}
						/>
						<p className="admin-help">Endereço: /noticias/{slug || "..."}</p>
					</div>
					<MediaField
						label="Imagem de capa"
						value={coverImageUrl}
						onChange={setCoverImageUrl}
					/>
					<Field
						label="Categoria (PT)"
						name="categoryPt"
						defaultValue={initial?.categoryPt}
						hint="Ex.: Formação, Eventos, Parcerias."
					/>
					<Field label="Categoria (EN)" name="categoryEn" defaultValue={initial?.categoryEn} />
					<Field
						label="Resumo (PT)"
						name="excerptPt"
						defaultValue={initial?.excerptPt}
						hint="Texto curto usado nos cartões da listagem."
						multiline
					/>
					<Field label="Resumo (EN)" name="excerptEn" defaultValue={initial?.excerptEn} multiline />
				</div>
			</div>

			<div data-tab="bodyPt" role="tabpanel" hidden={activeTab !== "bodyPt"}>
				<RichTextEditor value={bodyPt} onChange={setBodyPt} />
			</div>

			<div data-tab="bodyEn" role="tabpanel" hidden={activeTab !== "bodyEn"}>
				<RichTextEditor value={bodyEn} onChange={setBodyEn} />
				<p className="admin-help">Se ficar vazio, o site mostra o conteúdo em português.</p>
			</div>

			<div
				data-tab="publish"
				role="tabpanel"
				hidden={activeTab !== "publish"}
				className="admin-form-stack"
			>
				<div className="admin-form-grid">
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
				<label className="admin-check-row">
					<input
						className="form-check-input"
						type="checkbox"
						name="isFeatured"
						value="1"
						defaultChecked={initial?.isFeatured}
					/>
					Destaque (aparece primeiro)
				</label>
			</div>

			{error ? <p className="admin-alert-error mb-0">{error}</p> : null}

			<div className="d-flex gap-3">
				<button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
					{pending ? "A guardar..." : mode === "create" ? "Criar notícia" : "Guardar"}
				</button>
				<Link href="/backoffice/noticias" className="admin-btn admin-btn-outline">
					Cancelar
				</Link>
			</div>
		</form>
	);
}

function Field({
	label,
	name,
	defaultValue,
	required,
	type = "text",
	multiline,
	hint,
}: {
	label: string;
	name: string;
	defaultValue?: string;
	required?: boolean;
	type?: string;
	multiline?: boolean;
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
					rows={3}
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

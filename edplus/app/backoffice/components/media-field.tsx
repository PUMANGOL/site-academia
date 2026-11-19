"use client";

import { useRef, useState } from "react";
import AdminModal from "@/app/backoffice/components/admin-modal";

type MediaItem = { id: string; url: string; originalName: string };

export async function uploadMedia(file: File): Promise<string> {
	const body = new FormData();
	body.append("file", file);
	const response = await fetch("/api/admin/media", { method: "POST", body });
	const result = (await response.json().catch(() => ({}))) as {
		url?: string;
		error?: string;
	};
	if (!response.ok || !result.url) {
		throw new Error(result.error ?? "Não foi possível enviar a imagem.");
	}
	return result.url;
}

// Escolha de imagem: enviar do computador, escolher da biblioteca ou colar um URL.
export default function MediaField({
	label,
	name,
	value,
	onChange,
	required,
	hint,
	placeholder,
}: {
	label: string;
	name?: string;
	value: string;
	onChange: (url: string) => void;
	required?: boolean;
	hint?: string;
	// Imagem usada no site quando o campo fica vazio.
	placeholder?: string;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const [libraryOpen, setLibraryOpen] = useState(false);
	const [library, setLibrary] = useState<MediaItem[] | null>(null);

	async function onFile(file: File | undefined) {
		if (!file) return;
		setError("");
		setUploading(true);
		try {
			onChange(await uploadMedia(file));
			setLibrary(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro no envio.");
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	async function openLibrary() {
		setLibraryOpen(true);
		if (library) return;
		const response = await fetch("/api/admin/media");
		const result = (await response.json().catch(() => ({}))) as {
			items?: MediaItem[];
		};
		setLibrary(result.items ?? []);
	}

	return (
		<div>
			<label className="admin-label">{label}</label>
			<div className="admin-media-field">
				<div className="admin-media-preview">
					{value || placeholder ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={value || placeholder} alt="" className={value ? undefined : "is-fallback"} />
					) : (
						<i className="ph ph-image" aria-hidden />
					)}
				</div>
				<div className="admin-media-controls">
					<input
						name={name}
						value={value}
						onChange={(event) => onChange(event.target.value)}
						required={required}
						placeholder={placeholder || "/media/... ou https://..."}
						className="admin-input form-control"
					/>
					<div className="d-flex flex-wrap gap-2">
						<button
							type="button"
							className="admin-btn admin-btn-outline admin-btn-sm"
							onClick={() => inputRef.current?.click()}
							disabled={uploading}
						>
							<i className="ph ph-upload-simple" aria-hidden />
							{uploading ? "A enviar..." : "Enviar imagem"}
						</button>
						<button
							type="button"
							className="admin-btn admin-btn-ghost admin-btn-sm"
							onClick={openLibrary}
						>
							<i className="ph ph-images" aria-hidden />
							Biblioteca
						</button>
						{value ? (
							<button
								type="button"
								className="admin-btn admin-btn-ghost admin-btn-sm"
								onClick={() => onChange("")}
							>
								Remover
							</button>
						) : null}
					</div>
					<input
						ref={inputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
						hidden
						onChange={(event) => onFile(event.target.files?.[0])}
					/>
				</div>
			</div>
			{error ? <p className="admin-help text-danger">{error}</p> : null}
			{hint ? <p className="admin-help">{hint}</p> : null}

			<AdminModal
				open={libraryOpen}
				onClose={() => setLibraryOpen(false)}
				title="Biblioteca de imagens"
				size="lg"
			>
				{library === null ? (
					<p className="mb-0">A carregar...</p>
				) : library.length === 0 ? (
					<p className="mb-0">Ainda não há imagens. Use &quot;Enviar imagem&quot;.</p>
				) : (
					<div className="admin-media-grid">
						{library.map((item) => (
							<button
								type="button"
								key={item.id}
								className={`admin-media-item${item.url === value ? " is-selected" : ""}`}
								title={item.originalName}
								onClick={() => {
									onChange(item.url);
									setLibraryOpen(false);
								}}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={item.url} alt={item.originalName} loading="lazy" />
							</button>
						))}
					</div>
				)}
			</AdminModal>
		</div>
	);
}

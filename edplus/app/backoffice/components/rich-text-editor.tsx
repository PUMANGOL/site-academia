"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { uploadMedia } from "@/app/backoffice/components/media-field";
import type { RichTextDoc } from "@/db/schema";

// Os mesmos nós que app/components/rich-text.tsx sabe desenhar no site.
const baseExtensions = [
	StarterKit.configure({
		heading: { levels: [2, 3, 4] },
		link: {
			openOnClick: false,
			autolink: true,
			protocols: ["mailto", "tel"],
		},
	}),
	Image.configure({ inline: false }),
];

export default function RichTextEditor({
	value,
	onChange,
	placeholder,
}: {
	value: RichTextDoc | null;
	onChange: (doc: RichTextDoc) => void;
	placeholder?: string;
}) {
	const editor = useEditor({
		extensions: [
			...baseExtensions,
			Placeholder.configure({ placeholder: placeholder ?? "Escreva aqui o conteúdo..." }),
		],
		content: value ?? undefined,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: "admin-rte-content rich-text",
			},
		},
		onUpdate: ({ editor }) => onChange(editor.getJSON() as RichTextDoc),
	});

	return (
		<div className="admin-rte">
			{editor ? <Toolbar editor={editor} /> : null}
			<EditorContent editor={editor} />
		</div>
	);
}

function Toolbar({ editor }: { editor: Editor }) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const state = useEditorState({
		editor,
		selector: ({ editor }) => ({
			bold: editor.isActive("bold"),
			italic: editor.isActive("italic"),
			underline: editor.isActive("underline"),
			strike: editor.isActive("strike"),
			h2: editor.isActive("heading", { level: 2 }),
			h3: editor.isActive("heading", { level: 3 }),
			bulletList: editor.isActive("bulletList"),
			orderedList: editor.isActive("orderedList"),
			blockquote: editor.isActive("blockquote"),
			link: editor.isActive("link"),
			canUndo: editor.can().undo(),
			canRedo: editor.can().redo(),
		}),
	});

	function setLink() {
		const previous = editor.getAttributes("link").href as string | undefined;
		const href = window.prompt("Endereço do link (vazio para remover)", previous ?? "https://");
		if (href === null) return;
		if (href.trim() === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
	}

	async function insertImage(file: File | undefined) {
		if (!file) return;
		setUploading(true);
		try {
			const src = await uploadMedia(file);
			editor.chain().focus().setImage({ src, alt: "" }).run();
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Erro no envio.");
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	}

	const chain = () => editor.chain().focus();
	const buttons: {
		icon: string;
		label: string;
		active?: boolean;
		disabled?: boolean;
		run: () => void;
	}[] = [
		{ icon: "ph-text-b", label: "Negrito", active: state.bold, run: () => chain().toggleBold().run() },
		{ icon: "ph-text-italic", label: "Itálico", active: state.italic, run: () => chain().toggleItalic().run() },
		{ icon: "ph-text-underline", label: "Sublinhado", active: state.underline, run: () => chain().toggleUnderline().run() },
		{ icon: "ph-text-strikethrough", label: "Riscado", active: state.strike, run: () => chain().toggleStrike().run() },
		{ icon: "ph-text-h-two", label: "Título", active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
		{ icon: "ph-text-h-three", label: "Subtítulo", active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
		{ icon: "ph-list-bullets", label: "Lista", active: state.bulletList, run: () => chain().toggleBulletList().run() },
		{ icon: "ph-list-numbers", label: "Lista numerada", active: state.orderedList, run: () => chain().toggleOrderedList().run() },
		{ icon: "ph-quotes", label: "Citação", active: state.blockquote, run: () => chain().toggleBlockquote().run() },
		{ icon: "ph-link", label: "Link", active: state.link, run: setLink },
		{ icon: "ph-minus", label: "Separador", run: () => chain().setHorizontalRule().run() },
		{ icon: "ph-arrow-counter-clockwise", label: "Desfazer", disabled: !state.canUndo, run: () => chain().undo().run() },
		{ icon: "ph-arrow-clockwise", label: "Refazer", disabled: !state.canRedo, run: () => chain().redo().run() },
	];

	return (
		<div className="admin-rte-toolbar" role="toolbar">
			{buttons.map((button) => (
				<button
					key={button.icon}
					type="button"
					title={button.label}
					aria-label={button.label}
					aria-pressed={button.active}
					disabled={button.disabled}
					className={`admin-rte-btn${button.active ? " is-active" : ""}`}
					onClick={button.run}
				>
					<i className={`ph ${button.icon}`} aria-hidden />
				</button>
			))}
			<button
				type="button"
				title={uploading ? "A enviar..." : "Imagem"}
				aria-label="Imagem"
				disabled={uploading}
				className="admin-rte-btn"
				onClick={() => fileRef.current?.click()}
			>
				<i className="ph ph-image" aria-hidden />
			</button>
			<input
				ref={fileRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
				hidden
				onChange={(event) => insertImage(event.target.files?.[0])}
			/>
		</div>
	);
}

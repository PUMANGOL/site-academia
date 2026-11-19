export type Localized = {
	pt: string;
	en: string;
};

export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type CourseModality = "in_person" | "online";
export type CourseStatus = "draft" | "published" | "archived";
export type UserRole = "student" | "instructor" | "admin";
export type ContentStatus = "draft" | "published" | "archived";

// Documento do editor Tiptap (formato JSON do ProseMirror).
export type RichTextNode = {
	type: string;
	attrs?: Record<string, unknown>;
	content?: RichTextNode[];
	marks?: { type: string; attrs?: Record<string, unknown> }[];
	text?: string;
};

export type RichTextDoc = RichTextNode & { type: "doc" };

export type LocalizedRichText = {
	pt: RichTextDoc | null;
	en: RichTextDoc | null;
};

// Valores guardados num bloco: texto simples, texto traduzido, rich text, listas de itens...
export type BlockValue =
	| string
	| number
	| boolean
	| null
	| Localized
	| LocalizedRichText
	| Record<string, unknown>[];

export type PageBlockSettings = {
	// Esconde o bloco só num tipo de ecrã.
	hideOn?: "mobile" | "desktop";
	// Âncora para links do tipo /pagina#ancora.
	anchor?: string;
};

export type PageBlock = {
	id: string;
	type: string;
	hidden?: boolean;
	settings?: PageBlockSettings;
	data: Record<string, BlockValue>;
};

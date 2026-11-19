"use client";

import { isRichTextEmpty } from "@/app/components/rich-text";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { BlockValue, LocalizedRichText, RichTextDoc } from "@/db/schema";
import { blockDefinitionMap, localizedText } from "@/lib/page-blocks";

export type BlockData = Record<string, BlockValue>;
export type BlockItem = Record<string, BlockValue>;

// URLs externos colados no backoffice não passam pelo optimizador de imagens
// (em next.config só github.com está autorizado).
export const isExternal = (src: string) => /^https?:/i.test(src);

// Lê os valores de um bloco com os valores por omissão do registo (lib/page-blocks.ts).
// Sem `data` (uso fora do construtor de páginas) devolve sempre os valores por omissão.
export function useBlockContent(type: string, data?: BlockData) {
	const { t, locale } = useI18n();
	const def = blockDefinitionMap.get(type);

	function field(name: string) {
		return def?.fields.find((item) => item.name === name);
	}

	function text(name: string) {
		const value = localizedText(data?.[name], locale).trim();
		if (value) return value;
		const fallbackKey = field(name)?.fallbackKey;
		if (fallbackKey) return t(fallbackKey);
		const fallback = field(name)?.fallback;
		return typeof fallback === "string" ? fallback : "";
	}

	function flag(name: string) {
		const value = data?.[name];
		if (typeof value === "boolean") return value;
		return field(name)?.fallback === true;
	}

	function list(name: string): BlockItem[] {
		const value = data?.[name];
		if (Array.isArray(value) && value.length) return value as BlockItem[];
		return (def?.lists?.find((item) => item.name === name)?.defaultItems ?? []) as BlockItem[];
	}

	function itemText(item: BlockItem, name: string) {
		return localizedText(item[name], locale).trim();
	}

	function richText(name: string): RichTextDoc | null {
		const value = data?.[name] as LocalizedRichText | undefined;
		const localized = value?.[locale];
		return isRichTextEmpty(localized) ? value?.pt ?? null : localized!;
	}

	return { t, locale, text, flag, list, itemText, richText };
}

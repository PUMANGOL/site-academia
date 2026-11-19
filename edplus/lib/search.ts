// Pesquisa sem distinção de maiúsculas nem acentos ("formacao" encontra "Formação").
export function normalizeSearch(value: string) {
	return value
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim();
}

// Todas as palavras da pesquisa têm de aparecer no texto (por qualquer ordem).
export function matchesAllTerms(query: string, haystack: string) {
	const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
	if (!terms.length) return true;
	return terms.every((term) => haystack.includes(term));
}

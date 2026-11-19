import { getPageBySlug, getPublishedPosts } from "@/db/queries/content";
import { getPublishedCourses } from "@/db/queries/courses";
import { editablePages, type EditablePageSlug } from "@/lib/page-blocks";
import { blockNeeds } from "./page-blocks";

// Blocos de uma página editável e os dados da BD de que precisam.
// Publicada -> publishedBlocks; nunca publicada -> layout padrão; preview -> rascunho.
export async function loadPage(slug: EditablePageSlug, { draft = false } = {}) {
	const definition = editablePages[slug];
	const page = await getPageBySlug(slug);
	const blocks = draft
		? page?.draftBlocks ?? definition.defaultBlocks
		: page?.publishedBlocks ?? definition.defaultBlocks;
	// Na pré-visualização ao vivo podem ser adicionados blocos a qualquer momento: carrega tudo.
	const needs = draft ? { courses: true, posts: true, allPosts: true } : blockNeeds(blocks);

	const [courses, posts] = await Promise.all([
		needs.courses ? getPublishedCourses() : [],
		// A "Lista de notícias" precisa de todas; os outros blocos só das 6 mais recentes.
		needs.posts ? getPublishedPosts(needs.allPosts ? undefined : 12) : [],
	]);

	return { blocks, courses, posts, pageKey: definition.pageKey };
}

import { messages } from "@/app/i18n/messages";
import type { BlockValue, Localized, PageBlock, PageBlockSettings } from "@/db/schema";
import { isValidRichText } from "@/lib/content";

// Registo dos blocos que o backoffice pode usar para montar páginas.
// O mesmo registo serve o editor (campos a mostrar), a validação no servidor
// e o site (valores por omissão quando um campo fica vazio).

export type FieldKind =
	| "text"
	| "textarea"
	| "richtext"
	| "image"
	| "url"
	| "select"
	| "boolean";

export type FieldDef = {
	name: string;
	label: string;
	kind: FieldKind;
	// Guardado como { pt, en }. Aplica-se a text, textarea e richtext.
	localized?: boolean;
	// Chave de messages.ts usada quando o campo fica vazio.
	fallbackKey?: string;
	// Valor por omissão para campos não traduzidos (imagens, links, opções).
	fallback?: string | boolean;
	options?: { value: string; label: string }[];
	hint?: string;
};

export type ListDef = {
	name: string;
	label: string;
	itemLabel: string;
	fields: FieldDef[];
	max: number;
	// Itens mostrados no site enquanto a lista estiver vazia.
	defaultItems: Record<string, BlockValue>[];
};

export type BlockDef = {
	type: string;
	label: string;
	description: string;
	icon: string;
	fields: FieldDef[];
	lists?: ListDef[];
	// Blocos que dependem de dados da BD (cursos, notícias).
	// "allPosts" = todas as notícias publicadas (sem limite).
	needs?: "courses" | "posts" | "allPosts";
};

function lookup(tree: unknown, key: string) {
	let current = tree;
	for (const part of key.split(".")) {
		if (current && typeof current === "object" && part in current) {
			current = (current as Record<string, unknown>)[part];
		} else {
			return "";
		}
	}
	return typeof current === "string" ? current : "";
}

export function messageText(key: string): Localized {
	return { pt: lookup(messages.pt, key), en: lookup(messages.en, key) };
}

const backgroundOptions = [
	{ value: "default", label: "Normal" },
	{ value: "muted", label: "Fundo suave" },
	{ value: "brand", label: "Cor da marca" },
];

export const blockDefinitions: BlockDef[] = [
	{
		type: "hero",
		label: "Banner principal",
		description: "Título grande, texto, botão e indicadores no topo da página.",
		icon: "ph-flag-banner",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "banner.keepLearning" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "banner.title" },
			{ name: "highlight", label: "Título em destaque", kind: "text", localized: true, fallbackKey: "banner.titleFrom" },
			{ name: "text", label: "Texto", kind: "textarea", localized: true, fallbackKey: "banner.text" },
			{ name: "buttonLabel", label: "Texto do botão", kind: "text", localized: true, fallbackKey: "banner.findCourses" },
			{ name: "buttonHref", label: "Link do botão", kind: "url", fallback: "/#contacto" },
			{ name: "backgroundImage", label: "Imagem de fundo", kind: "image", fallback: "/assets/img/academia/hero-group.jpg" },
			{ name: "showCard", label: "Mostrar cartão de curso em destaque", kind: "boolean", fallback: false },
		],
		lists: [
			{
				name: "stats",
				label: "Indicadores",
				itemLabel: "Indicador",
				max: 2,
				fields: [
					{ name: "value", label: "Número", kind: "text" },
					{ name: "suffix", label: "Sufixo", kind: "text", hint: "Ex.: +, k, %" },
					{ name: "label", label: "Legenda", kind: "text", localized: true },
				],
				defaultItems: [
					{ value: "250", suffix: "+", label: messageText("banner.enrolledStudents") },
					{ value: "3652", suffix: "+", label: messageText("banner.finishedSession") },
				],
			},
		],
	},
	{
		type: "about",
		label: "Sobre nós",
		description: "Fotografias, texto de apresentação e destaques (missão, visão...).",
		icon: "ph-info",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "aboutPage.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "aboutPage.title" },
			{ name: "text", label: "Texto", kind: "textarea", localized: true, fallbackKey: "aboutPage.text" },
			{ name: "image1", label: "Fotografia principal", kind: "image", fallback: "/assets/img/academia/hero-group.jpg" },
			{ name: "image2", label: "Fotografia 2", kind: "image", fallback: "/assets/img/academia/event-talk.jpg" },
			{ name: "image3", label: "Fotografia 3", kind: "image", fallback: "/assets/img/academia/formacao-tablet.jpg" },
			{
				name: "imagePosition",
				label: "Posição das fotografias",
				kind: "select",
				fallback: "left",
				options: [
					{ value: "left", label: "À esquerda do texto" },
					{ value: "right", label: "À direita do texto" },
				],
			},
			{ name: "showButton", label: "Mostrar botão", kind: "boolean", fallback: true },
			{ name: "buttonLabel", label: "Texto do botão", kind: "text", localized: true, fallbackKey: "about.cta" },
			{ name: "buttonHref", label: "Link do botão", kind: "url", fallback: "/about" },
			{ name: "showVideo", label: "Mostrar vídeo institucional", kind: "boolean", fallback: false },
		],
		lists: [
			{
				name: "items",
				label: "Destaques",
				itemLabel: "Destaque",
				max: 3,
				fields: [
					{ name: "icon", label: "Ícone", kind: "image" },
					{ name: "title", label: "Título", kind: "text", localized: true },
					{ name: "text", label: "Texto", kind: "textarea", localized: true },
				],
				defaultItems: [
					{ icon: "/assets/img/icons/about/1.svg", title: messageText("aboutPage.mission"), text: messageText("aboutPage.itemText") },
					{ icon: "/assets/img/icons/about/2.svg", title: messageText("aboutPage.vision"), text: messageText("aboutPage.itemText") },
				],
			},
		],
	},
	{
		type: "categories",
		label: "Áreas de formação",
		description: "Grelha com as áreas de formação da academia.",
		icon: "ph-squares-four",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "category.eyebrow" },
			{ name: "title1", label: "Título (linha 1)", kind: "text", localized: true, fallbackKey: "category.title1" },
			{ name: "title2", label: "Título (linha 2)", kind: "text", localized: true, fallbackKey: "category.title2" },
		],
	},
	{
		type: "courses",
		label: "Cursos em destaque",
		description: "Lista dos cursos publicados, com filtro por área.",
		icon: "ph-book-open",
		needs: "courses",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "courses.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "courses.title" },
		],
	},
	{
		type: "counter",
		label: "Números",
		description: "Faixa com até quatro números de destaque.",
		icon: "ph-chart-bar",
		fields: [],
		lists: [
			{
				name: "items",
				label: "Números",
				itemLabel: "Número",
				max: 4,
				fields: [
					{ name: "icon", label: "Ícone", kind: "image" },
					{ name: "value", label: "Número", kind: "text" },
					{ name: "suffix", label: "Sufixo", kind: "text", hint: "Ex.: +, k, %" },
					{ name: "label", label: "Legenda", kind: "text", localized: true },
				],
				defaultItems: [
					{ icon: "/assets/img/icons/counter/peoples.svg", value: "118", suffix: "k", label: messageText("counter.students") },
					{ icon: "/assets/img/icons/counter/graduate-hat.svg", value: "150", suffix: "k", label: messageText("counter.learners") },
					{ icon: "/assets/img/icons/counter/expert.svg", value: "120", suffix: "+", label: messageText("counter.instructors") },
					{ icon: "/assets/img/icons/counter/satisfaction.svg", value: "96", suffix: "%", label: messageText("counter.satisfaction") },
				],
			},
		],
	},
	{
		type: "testimonials",
		label: "Testemunhos",
		description: "Carrossel com opiniões de formandos.",
		icon: "ph-chat-circle-text",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "testimonials.eyebrow" },
			{ name: "title", label: "Título (linha 1)", kind: "text", localized: true, fallbackKey: "testimonials.title" },
			{ name: "title2", label: "Título (linha 2)", kind: "text", localized: true, fallbackKey: "testimonials.title2" },
			{ name: "rating", label: "Avaliação média", kind: "text", fallback: "4.8" },
		],
		lists: [
			{
				name: "items",
				label: "Testemunhos",
				itemLabel: "Testemunho",
				max: 12,
				fields: [
					{ name: "photo", label: "Fotografia", kind: "image" },
					{ name: "name", label: "Nome", kind: "text" },
					{ name: "role", label: "Função / origem", kind: "text", localized: true },
					{ name: "quote", label: "Testemunho", kind: "textarea", localized: true },
				],
				defaultItems: [
					{ photo: "/assets/img/academia/formador-a.jpg", name: "Nuno Baptista", role: messageText("testimonials.country"), quote: messageText("testimonials.quote") },
					{ photo: "/assets/img/academia/formador-katy.jpg", name: "Maria Fernandes", role: messageText("testimonials.country"), quote: messageText("testimonials.quote") },
					{ photo: "/assets/img/academia/formador-fernando.jpg", name: "Paulo Domingos", role: messageText("testimonials.country"), quote: messageText("testimonials.quote") },
				],
			},
		],
	},
	{
		type: "cta",
		label: "Chamadas para acção",
		description: "Um ou dois cartões coloridos com botão.",
		icon: "ph-megaphone",
		fields: [],
		lists: [
			{
				name: "cards",
				label: "Cartões",
				itemLabel: "Cartão",
				max: 2,
				fields: [
					{ name: "title", label: "Título", kind: "text", localized: true },
					{ name: "highlight", label: "Título em destaque", kind: "text", localized: true },
					{ name: "text", label: "Texto", kind: "textarea", localized: true },
					{ name: "buttonLabel", label: "Texto do botão", kind: "text", localized: true },
					{ name: "buttonHref", label: "Link do botão", kind: "url" },
					{ name: "image", label: "Imagem", kind: "image" },
					{
						name: "color",
						label: "Cor",
						kind: "select",
						fallback: "blue",
						options: [
							{ value: "blue", label: "Midnight Green" },
							{ value: "green", label: "Verde Pumangol" },
						],
					},
				],
				defaultItems: [
					{
						title: messageText("cta.free"),
						highlight: messageText("cta.freeHighlight"),
						text: messageText("cta.text"),
						buttonLabel: messageText("cta.apply"),
						buttonHref: "/contact",
						image: "/assets/img/academia/formacao-portrait.jpg",
						color: "blue",
					},
					{
						title: messageText("cta.tutor"),
						highlight: messageText("cta.tutorHighlight"),
						text: messageText("cta.text"),
						buttonLabel: messageText("cta.register"),
						buttonHref: "/catalogo",
						image: "/assets/img/cta/2.jpg",
						color: "green",
					},
				],
			},
		],
	},
	{
		type: "introStats",
		label: "Cria futuro. (introdução)",
		description: "Título, parceria, manifesto e números da Academia.",
		icon: "ph-chart-line-up",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "intro.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "intro.title" },
			{ name: "highlight", label: "Título em destaque", kind: "text", localized: true, fallbackKey: "intro.highlight" },
			{ name: "text", label: "Texto", kind: "textarea", localized: true, fallbackKey: "intro.text" },
			{ name: "partnerLabel", label: "Rótulo da parceria", kind: "text", localized: true, fallbackKey: "intro.partnerLabel" },
			{ name: "partnerName", label: "Parceiro", kind: "text", localized: true, fallbackKey: "intro.partnerName" },
			{ name: "manifesto", label: "Manifesto", kind: "textarea", localized: true, fallbackKey: "intro.manifesto" },
		],
		lists: [
			{
				name: "stats",
				label: "Números",
				itemLabel: "Número",
				max: 3,
				fields: [
					{ name: "value", label: "Número", kind: "text" },
					{ name: "suffix", label: "Sufixo", kind: "text" },
					{ name: "label", label: "Legenda", kind: "text", localized: true },
				],
				defaultItems: [
					{ value: "14", suffix: "+", label: messageText("intro.stat1") },
					{ value: "2500", suffix: "+", label: messageText("intro.stat2") },
					{ value: "45000", suffix: "+", label: messageText("intro.stat3") },
				],
			},
		],
	},
	{
		type: "featuredPrograms",
		label: "Programas em destaque",
		description: "Cartões empilhados com os programas em evidência.",
		icon: "ph-stack",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "featured.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "featured.title" },
			{ name: "lead", label: "Texto", kind: "textarea", localized: true, fallbackKey: "featured.lead" },
			{ name: "enroll", label: "Texto do botão dos cartões", kind: "text", localized: true, fallbackKey: "featured.enroll" },
			{ name: "buttonLabel", label: "Texto do botão final", kind: "text", localized: true, fallbackKey: "featured.buttonLabel" },
			{ name: "buttonHref", label: "Link do botão final", kind: "url", fallback: "/calendario" },
			{ name: "note", label: "Nota", kind: "text", localized: true, fallbackKey: "featured.note" },
		],
		lists: [
			{
				name: "items",
				label: "Programas",
				itemLabel: "Programa",
				max: 6,
				fields: [
					{ name: "tag", label: "Área", kind: "text", localized: true },
					{ name: "title", label: "Título", kind: "text", localized: true },
					{ name: "text", label: "Texto", kind: "textarea", localized: true },
					{ name: "date", label: "Datas", kind: "text", localized: true },
					{ name: "hours", label: "Carga horária", kind: "text", localized: true },
					{ name: "place", label: "Local", kind: "text", localized: true, fallbackKey: "featured.place" },
					{ name: "who", label: "Formadores / nota", kind: "text", localized: true },
					{ name: "image", label: "Imagem", kind: "image" },
					{ name: "href", label: "Link", kind: "url", fallback: "/catalogo" },
				],
				defaultItems: [
					{
						tag: messageText("featured.p1Tag"),
						title: messageText("featured.p1Title"),
						text: messageText("featured.p1Text"),
						date: messageText("featured.p1Date"),
						hours: messageText("featured.p1Hours"),
						place: messageText("featured.place"),
						who: messageText("featured.p1Who"),
						image: "/assets/img/academia/hero-stage.jpg",
						href: "/catalogo",
					},
					{
						tag: messageText("featured.p2Tag"),
						title: messageText("featured.p2Title"),
						text: messageText("featured.p2Text"),
						date: messageText("featured.p2Date"),
						hours: messageText("featured.p2Hours"),
						place: messageText("featured.place"),
						who: messageText("featured.p2Who"),
						image: "/assets/img/academia/hero-group.jpg",
						href: "/catalogo",
					},
					{
						tag: messageText("featured.p3Tag"),
						title: messageText("featured.p3Title"),
						text: messageText("featured.p3Text"),
						date: messageText("featured.p3Date"),
						hours: messageText("featured.p3Hours"),
						place: messageText("featured.place"),
						who: messageText("featured.p3Who"),
						image: "/assets/img/academia/formador-andreas.jpg",
						href: "/catalogo",
					},
				],
			},
		],
	},
	{
		type: "forCompanies",
		label: "Formação à medida",
		description: "Secção para empresas com passos do diagnóstico à execução.",
		icon: "ph-buildings",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "empresas.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "empresas.title" },
			{ name: "text", label: "Texto", kind: "textarea", localized: true, fallbackKey: "empresas.text" },
			{ name: "image", label: "Imagem", kind: "image", fallback: "/assets/img/academia/event-talk.jpg" },
			{ name: "float", label: "Etiqueta flutuante", kind: "text", localized: true, fallbackKey: "empresas.float" },
			{ name: "percent", label: "Percentagem", kind: "text", localized: true, fallbackKey: "empresas.percent" },
			{ name: "percentLabel", label: "Legenda da percentagem", kind: "text", localized: true, fallbackKey: "empresas.percentLabel" },
			{ name: "buttonLabel", label: "Texto do botão", kind: "text", localized: true, fallbackKey: "empresas.cta" },
			{ name: "buttonHref", label: "Link do botão", kind: "url", fallback: "/#contacto" },
			{ name: "linkLabel", label: "Ligação secundária", kind: "text", localized: true, fallbackKey: "empresas.link" },
			{ name: "linkHref", label: "Link secundário", kind: "url", fallback: "/catalogo" },
		],
		lists: [
			{
				name: "steps",
				label: "Passos",
				itemLabel: "Passo",
				max: 4,
				fields: [
					{ name: "n", label: "Número", kind: "text" },
					{ name: "title", label: "Título", kind: "text", localized: true },
					{ name: "text", label: "Texto", kind: "text", localized: true },
				],
				defaultItems: [
					{ n: "01", title: messageText("empresas.s1Title"), text: messageText("empresas.s1Text") },
					{ n: "02", title: messageText("empresas.s2Title"), text: messageText("empresas.s2Text") },
					{ n: "03", title: messageText("empresas.s3Title"), text: messageText("empresas.s3Text") },
					{ n: "04", title: messageText("empresas.s4Title"), text: messageText("empresas.s4Text") },
				],
			},
		],
	},
	{
		type: "trainersHighlight",
		label: "Formadores em destaque",
		description: "Grelha de formadores com overlay ao passar o rato.",
		icon: "ph-chalkboard-teacher",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "trainersHome.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "trainersHome.title" },
			{ name: "lead", label: "Texto", kind: "textarea", localized: true, fallbackKey: "trainersHome.lead" },
			{ name: "buttonLabel", label: "Texto do botão", kind: "text", localized: true, fallbackKey: "trainersHome.cta" },
			{ name: "buttonHref", label: "Link do botão", kind: "url", fallback: "/instructors" },
			{ name: "teaches", label: "Rótulo do overlay", kind: "text", localized: true, fallbackKey: "trainersHome.teaches" },
		],
		lists: [
			{
				name: "items",
				label: "Formadores",
				itemLabel: "Formador",
				max: 8,
				fields: [
					{ name: "name", label: "Nome", kind: "text" },
					{ name: "role", label: "Função", kind: "textarea", localized: true },
					{ name: "teaches", label: "Leciona", kind: "textarea", localized: true },
					{ name: "photo", label: "Fotografia", kind: "image" },
					{ name: "href", label: "Link", kind: "url", fallback: "/instructors" },
				],
				defaultItems: [
					{
						name: "Andreas Galsterer",
						role: messageText("trainersHome.t1Role"),
						teaches: messageText("trainersHome.t1Teaches"),
						photo: "/assets/img/academia/formador-andreas.jpg",
						href: "/instructors",
					},
					{
						name: "Katy Martilíano",
						role: messageText("trainersHome.t2Role"),
						teaches: messageText("trainersHome.t2Teaches"),
						photo: "/assets/img/academia/formador-katy.jpg",
						href: "/instructors",
					},
					{
						name: "Fernando Fallé",
						role: messageText("trainersHome.t3Role"),
						teaches: messageText("trainersHome.t3Teaches"),
						photo: "/assets/img/academia/formador-fernando.jpg",
						href: "/instructors",
					},
					{
						name: "Miguel Soares",
						role: messageText("trainersHome.t4Role"),
						teaches: messageText("trainersHome.t4Teaches"),
						photo: "/assets/img/academia/formador-miguel.jpg",
						href: "/instructors",
					},
				],
			},
		],
	},
	{
		type: "futureCta",
		label: "O futuro não se espera",
		description: "Faixa final com convite, botões e pedido do catálogo.",
		icon: "ph-rocket-launch",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "futureCta.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "futureCta.title" },
			{ name: "highlight", label: "Título em destaque", kind: "text", localized: true, fallbackKey: "futureCta.highlight" },
			{ name: "text", label: "Texto", kind: "textarea", localized: true, fallbackKey: "futureCta.text" },
			{ name: "buttonLabel", label: "Texto do botão", kind: "text", localized: true, fallbackKey: "futureCta.cta" },
			{ name: "buttonHref", label: "Link do botão", kind: "url", fallback: "/#contacto" },
			{ name: "programsLabel", label: "Botão secundário", kind: "text", localized: true, fallbackKey: "futureCta.programs" },
			{ name: "programsHref", label: "Link secundário", kind: "url", fallback: "/catalogo" },
			{ name: "catalogLabel", label: "Rótulo do catálogo", kind: "text", localized: true, fallbackKey: "futureCta.catalogLabel" },
			{ name: "emailPlaceholder", label: "Placeholder do email", kind: "text", localized: true, fallbackKey: "futureCta.emailPlaceholder" },
			{ name: "catalogCta", label: "Botão do catálogo", kind: "text", localized: true, fallbackKey: "futureCta.catalogCta" },
			{ name: "catalogSending", label: "A enviar", kind: "text", localized: true, fallbackKey: "futureCta.catalogSending" },
			{ name: "catalogSent", label: "Confirmação", kind: "text", localized: true, fallbackKey: "futureCta.catalogSent" },
			{ name: "catalogSentDetail", label: "Detalhe da confirmação", kind: "text", localized: true, fallbackKey: "futureCta.catalogSentDetail" },
			{ name: "catalogError", label: "Erro de envio", kind: "text", localized: true, fallbackKey: "futureCta.catalogError" },
			{ name: "soon", label: "Em breve (negrito)", kind: "text", localized: true, fallbackKey: "futureCta.soon" },
			{ name: "soonText", label: "Em breve (resto)", kind: "text", localized: true, fallbackKey: "futureCta.soonText" },
			{ name: "notify", label: "Ligação de aviso", kind: "text", localized: true, fallbackKey: "futureCta.notify" },
			{ name: "notifyHref", label: "Link de aviso", kind: "url", fallback: "/#contacto" },
			{ name: "image", label: "Imagem de fundo", kind: "image", fallback: "/assets/img/academia/event-women.jpg" },
		],
	},
	{
		type: "latestNews",
		label: "Últimas notícias",
		description: "Carrossel das notícias publicadas no backoffice.",
		icon: "ph-newspaper",
		needs: "posts",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "news.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "news.title" },
			{ name: "titleHighlight", label: "Título em destaque", kind: "text", localized: true, fallbackKey: "news.titleHighlight" },
			{
				name: "count",
				label: "Quantidade",
				kind: "select",
				fallback: "6",
				options: [
					{ value: "3", label: "3 notícias" },
					{ value: "6", label: "6 notícias" },
				],
			},
			{ name: "background", label: "Fundo", kind: "select", fallback: "default", options: backgroundOptions },
		],
	},
	{
		type: "newsList",
		label: "Lista de notícias",
		description: "Todas as notícias publicadas, com filtro por categoria e botão \"carregar mais\".",
		icon: "ph-list-bullets",
		needs: "allPosts",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "news.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "news.title" },
			{
				name: "featureFirst",
				label: "Mostrar a primeira notícia em cartão grande",
				kind: "boolean",
				fallback: true,
				hint: "As notícias marcadas como destaque aparecem primeiro; depois as mais recentes.",
			},
			{ name: "showFilters", label: "Mostrar filtro por categoria", kind: "boolean", fallback: true },
			{
				name: "pageSize",
				label: "Notícias por carregamento",
				kind: "select",
				fallback: "9",
				options: [
					{ value: "6", label: "6 notícias" },
					{ value: "9", label: "9 notícias" },
					{ value: "12", label: "12 notícias" },
				],
			},
			{ name: "buttonLabel", label: "Texto do botão final", kind: "text", localized: true, fallbackKey: "news.cta" },
			{ name: "buttonHref", label: "Link do botão final", kind: "url", fallback: "/contact" },
		],
	},
	{
		type: "companyForm",
		label: "Formulário de empresas",
		description: "Texto de apresentação e formulário de pedido de formação à medida.",
		icon: "ph-buildings",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "partners.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "partners.title" },
			{ name: "lead", label: "Texto de introdução", kind: "textarea", localized: true, fallbackKey: "partners.lead" },
			{ name: "formTitle", label: "Título do formulário", kind: "text", localized: true, fallbackKey: "partners.formTitle" },
			{ name: "formText", label: "Texto do formulário", kind: "text", localized: true, fallbackKey: "partners.formText" },
		],
		lists: [
			{
				name: "benefits",
				label: "Vantagens",
				itemLabel: "Vantagem",
				max: 6,
				fields: [{ name: "text", label: "Texto", kind: "textarea", localized: true }],
				defaultItems: [
					{ text: messageText("partners.p1") },
					{ text: messageText("partners.p2") },
					{ text: messageText("partners.p3") },
				],
			},
		],
	},	{
		type: "imageText",
		label: "Imagem e texto",
		description: "Imagem ao lado de um texto, com botão opcional.",
		icon: "ph-image-square",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true },
			{ name: "title", label: "Título", kind: "text", localized: true },
			{ name: "body", label: "Texto", kind: "richtext", localized: true },
			{ name: "image", label: "Imagem", kind: "image" },
			{
				name: "imagePosition",
				label: "Posição da imagem",
				kind: "select",
				fallback: "left",
				options: [
					{ value: "left", label: "À esquerda" },
					{ value: "right", label: "À direita" },
				],
			},
			{ name: "buttonLabel", label: "Texto do botão", kind: "text", localized: true },
			{ name: "buttonHref", label: "Link do botão", kind: "url" },
			{ name: "background", label: "Fundo", kind: "select", fallback: "default", options: backgroundOptions },
		],
	},
	{
		type: "richText",
		label: "Texto livre",
		description: "Secção de texto formatado (títulos, listas, links, imagens).",
		icon: "ph-text-align-left",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true },
			{ name: "title", label: "Título", kind: "text", localized: true },
			{ name: "body", label: "Conteúdo", kind: "richtext", localized: true },
			{
				name: "width",
				label: "Largura",
				kind: "select",
				fallback: "narrow",
				options: [
					{ value: "narrow", label: "Estreita (leitura)" },
					{ value: "wide", label: "Largura total" },
				],
			},
			{ name: "background", label: "Fundo", kind: "select", fallback: "default", options: backgroundOptions },
		],
	},
	{
		type: "pageBanner",
		label: "Banner de página",
		description: "Faixa de topo com o título da página e o caminho de navegação.",
		icon: "ph-rectangle",
		fields: [
			{ name: "title", label: "Título", kind: "text", localized: true, hint: "Vazio = nome da página." },
			{ name: "backgroundImage", label: "Imagem de fundo", kind: "image", fallback: "/assets/img/academia/hero-stage.jpg" },
		],
	},
	{
		type: "video",
		label: "Vídeo",
		description: "Vídeo do YouTube com capa, título e botão de reprodução.",
		icon: "ph-video",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "video.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true, fallbackKey: "video.title" },
			{ name: "intro", label: "Texto sobre o vídeo (linha 1)", kind: "text", localized: true, fallbackKey: "video.intro" },
			{ name: "intro2", label: "Texto sobre o vídeo (linha 2)", kind: "text", localized: true, fallbackKey: "video.intro2" },
			{
				name: "youtube",
				label: "Link ou código do YouTube",
				kind: "text",
				fallback: "Z8PMsGDGL5U",
				hint: "Ex.: https://www.youtube.com/watch?v=XXXXXXXXXXX",
			},
		],
	},
	{
		type: "features",
		label: "Destaques em carrossel",
		description: "Cartões com ícone, título e texto que deslizam automaticamente.",
		icon: "ph-cards",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true },
			{ name: "title", label: "Título", kind: "text", localized: true },
			{ name: "linkLabel", label: "Texto do link dos cartões", kind: "text", localized: true, fallbackKey: "features.learnMore" },
		],
		lists: [
			{
				name: "items",
				label: "Cartões",
				itemLabel: "Cartão",
				max: 12,
				fields: [
					{ name: "icon", label: "Ícone", kind: "image" },
					{ name: "title", label: "Título", kind: "text", localized: true },
					{ name: "text", label: "Texto", kind: "textarea", localized: true },
					{ name: "href", label: "Link (opcional)", kind: "url" },
				],
				defaultItems: [
					{ icon: "/assets/img/icons/features/clock.svg", title: messageText("features.why"), text: messageText("features.desc") },
					{ icon: "/assets/img/icons/features/certificate.svg", title: messageText("features.cert"), text: messageText("features.desc") },
					{ icon: "/assets/img/icons/features/graduation-hat.svg", title: messageText("features.admission"), text: messageText("features.desc") },
					{ icon: "/assets/img/icons/features/teacher.svg", title: messageText("features.lecturers"), text: messageText("features.desc") },
				],
			},
		],
	},
	{
		type: "catalog",
		label: "Catálogo de cursos",
		description: "Todos os cursos publicados, com pesquisa e filtros por área.",
		icon: "ph-magnifying-glass",
		needs: "courses",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true },
			{ name: "title", label: "Título", kind: "text", localized: true },
			{ name: "showSearch", label: "Mostrar pesquisa", kind: "boolean", fallback: true },
			{ name: "showFilters", label: "Mostrar filtros por área", kind: "boolean", fallback: true },
		],
	},
	{
		type: "faq",
		label: "Perguntas frequentes",
		description: "Perguntas e respostas em acordeão.",
		icon: "ph-question",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true },
			{ name: "title", label: "Título", kind: "text", localized: true },
			{ name: "background", label: "Fundo", kind: "select", fallback: "default", options: backgroundOptions },
		],
		lists: [
			{
				name: "items",
				label: "Perguntas",
				itemLabel: "Pergunta",
				max: 20,
				fields: [
					{ name: "question", label: "Pergunta", kind: "text", localized: true },
					{ name: "answer", label: "Resposta", kind: "textarea", localized: true },
				],
				defaultItems: [1, 2, 3, 4, 5].map((n) => ({
					question: messageText(`faq.q${n}`),
					answer: messageText(`faq.a${n}`),
				})),
			},
		],
	},
	{
		type: "logos",
		label: "Logótipos",
		description: "Faixa de logótipos de parceiros ou clientes, com link opcional.",
		icon: "ph-handshake",
		fields: [
			{ name: "eyebrow", label: "Frase de topo", kind: "text", localized: true, fallbackKey: "partners.eyebrow" },
			{ name: "title", label: "Título", kind: "text", localized: true },
			{ name: "grayscale", label: "Logótipos a cinzento (cor ao passar o rato)", kind: "boolean", fallback: true },
			{ name: "background", label: "Fundo", kind: "select", fallback: "default", options: backgroundOptions },
		],
		lists: [
			{
				name: "items",
				label: "Logótipos",
				itemLabel: "Logótipo",
				max: 24,
				fields: [
					{ name: "image", label: "Imagem", kind: "image" },
					{ name: "name", label: "Nome", kind: "text" },
					{ name: "href", label: "Link (opcional)", kind: "url" },
				],
				defaultItems: [],
			},
		],
	},
];

export const blockDefinitionMap = new Map(blockDefinitions.map((def) => [def.type, def]));

// Grupos da janela "Adicionar bloco".
export const paletteGroups: { label: string; types: string[] }[] = [
	{ label: "Topo da página", types: ["hero", "pageBanner"] },
	{ label: "Apresentação", types: ["introStats", "about", "imageText", "richText", "video", "features"] },
	{ label: "Cursos e notícias", types: ["featuredPrograms", "courses", "catalog", "categories", "trainersHighlight", "latestNews", "newsList"] },
	{ label: "Confiança e conversão", types: ["forCompanies", "futureCta", "counter", "testimonials", "logos", "faq", "cta", "companyForm"] },
];

type EditablePage = {
	title: string;
	path: string;
	// Chave de messages.ts (pages.*) usada no banner quando o título fica vazio.
	pageKey: string;
	// Blocos sugeridos primeiro na janela "Adicionar bloco".
	suggested: string[];
	// Layout usado enquanto a página nunca foi publicada no backoffice.
	defaultBlocks: PageBlock[];
};

export type EditablePageSlug = "home" | "about" | "courses" | "news" | "partners";

// Páginas que o backoffice pode editar.
export const editablePages: Record<EditablePageSlug, EditablePage> = {
	about: {
		title: "Sobre",
		path: "/about",
		pageKey: "about",
		suggested: ["counter", "testimonials", "imageText", "logos", "cta"],
		defaultBlocks: [
			{ id: "default-video", type: "video", data: {} },
			{ id: "default-about", type: "about", data: { showButton: false } },
			{ id: "default-features", type: "features", data: {} },
		],
	},
	partners: {
		title: "Parceiros e empresas",
		path: "/parceiros",
		pageKey: "partners",
		suggested: ["logos", "testimonials", "counter", "faq", "cta"],
		defaultBlocks: [
			{ id: "default-banner", type: "pageBanner", data: {} },
			{ id: "default-company-form", type: "companyForm", data: {} },
			{ id: "default-logos", type: "logos", data: {} },
		],
	},
	news: {
		title: "Notícias",
		path: "/noticias",
		pageKey: "news",
		suggested: ["cta", "imageText", "logos", "richText", "faq"],
		defaultBlocks: [
			{ id: "default-banner", type: "pageBanner", data: { backgroundImage: "/assets/img/academia/hero-braids.jpg" } },
			{ id: "default-news", type: "newsList", data: {} },
		],
	},
	courses: {
		title: "Catálogo de cursos",
		path: "/catalogo",
		pageKey: "courses",
		suggested: ["faq", "cta", "testimonials", "richText", "logos"],
		defaultBlocks: [
			{ id: "default-banner", type: "pageBanner", data: {} },
			{ id: "default-catalog", type: "catalog", data: {} },
		],
	},
	home: {
		pageKey: "home",
		suggested: ["introStats", "featuredPrograms", "forCompanies", "trainersHighlight", "latestNews", "futureCta"],
		title: "Página inicial",
		path: "/",
		defaultBlocks: [
			{ id: "default-hero", type: "hero", data: {} },
			{ id: "default-intro", type: "introStats", data: {} },
			{ id: "default-categories", type: "categories", data: {} },
			{ id: "default-featured", type: "featuredPrograms", data: {} },
			{ id: "default-empresas", type: "forCompanies", data: {} },
			{ id: "default-trainers", type: "trainersHighlight", data: {} },
			{ id: "default-news", type: "latestNews", data: {} },
			{ id: "default-future", type: "futureCta", data: {} },
		],
	},
};

export function isEditablePage(slug: string): slug is EditablePageSlug {
	return Object.hasOwn(editablePages, slug);
}

// ---------- Validação (servidor) ----------

const MAX_BLOCKS = 40;
const MAX_TEXT = 300;
const MAX_TEXTAREA = 4000;

function isSafeLink(value: string) {
	return (
		value === "" ||
		value.startsWith("/") ||
		value.startsWith("#") ||
		/^(https?:|mailto:|tel:)/i.test(value)
	);
}

function isSafeImage(value: string) {
	return value === "" || value.startsWith("/") || /^https:\/\//i.test(value);
}

function cleanString(value: unknown, max: number) {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanField(field: FieldDef, value: unknown): BlockValue | undefined {
	const max = field.kind === "textarea" ? MAX_TEXTAREA : MAX_TEXT;

	switch (field.kind) {
		case "text":
		case "textarea": {
			if (field.localized) {
				const source = (value ?? {}) as Partial<Localized>;
				return { pt: cleanString(source.pt, max), en: cleanString(source.en, max) };
			}
			return cleanString(value, max);
		}
		case "richtext": {
			const source = (value ?? {}) as { pt?: unknown; en?: unknown };
			const pt = source.pt ?? null;
			const en = source.en ?? null;
			if (!isValidRichText(pt as never) || !isValidRichText(en as never)) {
				throw new Error(`Conteúdo inválido em "${field.label}".`);
			}
			return { pt, en } as BlockValue;
		}
		case "image": {
			const url = cleanString(value, 1000);
			if (!isSafeImage(url)) throw new Error(`Imagem inválida em "${field.label}".`);
			return url;
		}
		case "url": {
			const url = cleanString(value, 1000);
			if (!isSafeLink(url)) throw new Error(`Link inválido em "${field.label}".`);
			return url;
		}
		case "select": {
			const option = cleanString(value, 60);
			if (!option) return undefined;
			if (!field.options?.some((item) => item.value === option)) {
				throw new Error(`Opção inválida em "${field.label}".`);
			}
			return option;
		}
		case "boolean":
			return typeof value === "boolean" ? value : undefined;
	}
}

function cleanRecord(fields: FieldDef[], source: Record<string, unknown>) {
	const result: Record<string, BlockValue> = {};
	for (const field of fields) {
		const value = cleanField(field, source[field.name]);
		if (value !== undefined) result[field.name] = value;
	}
	return result;
}

// Mantém apenas blocos, campos e valores conhecidos. Lança Error com mensagem para o utilizador.
export function sanitizeBlocks(input: unknown): PageBlock[] {
	if (!Array.isArray(input)) throw new Error("Formato de blocos inválido.");
	if (input.length > MAX_BLOCKS) throw new Error(`Máximo de ${MAX_BLOCKS} blocos por página.`);

	const ids = new Set<string>();
	const anchors = new Set<string>();
	return input.map((raw) => {
		const block = (raw ?? {}) as Partial<PageBlock>;
		const def = blockDefinitionMap.get(String(block.type));
		if (!def) throw new Error("Tipo de bloco desconhecido.");

		const id = cleanString(block.id, 64);
		if (!id || ids.has(id)) throw new Error("Identificador de bloco inválido.");
		ids.add(id);

		const source = (block.data ?? {}) as Record<string, unknown>;
		const data = cleanRecord(def.fields, source);

		for (const list of def.lists ?? []) {
			const items = source[list.name];
			if (items === undefined) continue;
			if (!Array.isArray(items) || items.length > list.max) {
				throw new Error(`"${list.label}" aceita no máximo ${list.max} itens.`);
			}
			data[list.name] = items.map((item) =>
				cleanRecord(list.fields, (item ?? {}) as Record<string, unknown>)
			);
		}

		const rawSettings = (block.settings ?? {}) as Record<string, unknown>;
		const settings: PageBlockSettings = {};
		if (rawSettings.hideOn === "mobile" || rawSettings.hideOn === "desktop") {
			settings.hideOn = rawSettings.hideOn;
		}
		const anchor = cleanString(rawSettings.anchor, 60);
		if (anchor) {
			if (!ANCHOR_PATTERN.test(anchor)) {
				throw new Error(`Âncora inválida em "${def.label}": use letras minúsculas, números e hífens.`);
			}
			if (anchors.has(anchor)) throw new Error(`A âncora "${anchor}" está repetida.`);
			anchors.add(anchor);
			settings.anchor = anchor;
		}

		return { id, type: def.type, hidden: block.hidden === true, settings, data };
	});
}

export const ANCHOR_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const editablePageOrder: EditablePageSlug[] = ["home", "about", "courses", "news", "partners"];

// Extrai o id do YouTube de um link (watch, youtu.be, embed, shorts) ou aceita o próprio id.
export function youtubeId(value: string) {
	const input = value.trim();
	if (/^[\w-]{11}$/.test(input)) return input;
	const match = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
	return match ? match[1] : null;
}

// ---------- Leitura de valores (site e editor) ----------

export function isLocalized(value: unknown): value is Localized {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		"pt" in value &&
		(typeof (value as Localized).pt === "string" || typeof (value as Localized).en === "string")
	);
}

export function localizedText(value: unknown, locale: "pt" | "en") {
	if (typeof value === "string") return value;
	if (!isLocalized(value)) return "";
	return value[locale]?.trim() ? value[locale] : value.pt ?? "";
}

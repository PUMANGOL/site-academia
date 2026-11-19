import About from "@/app/components/about2";
import Banner from "@/app/components/banner";
import Category from "@/app/components/course-category";
import CounterUp from "@/app/components/counterUp";
import Courses from "@/app/components/courses1";
import CTA from "@/app/components/cta1";
import FeaturedPrograms from "@/app/components/featured-programs";
import Features from "@/app/components/features";
import ForCompanies from "@/app/components/for-companies";
import FutureCta from "@/app/components/future-cta";
import HomeBanner from "@/app/components/home-banner";
import IntroStats from "@/app/components/intro-stats";
import NewsCarousel from "@/app/components/news-carousel";
import Testimonials from "@/app/components/testimonials2";
import TrainersHighlight from "@/app/components/trainers-highlight";
import Video from "@/app/components/video";
import Catalog from "@/app/template-parts/courses";
import CompanyFormBlock from "./company-form";
import NewsList from "@/app/template-parts/news";
import type { PostListItem } from "@/db/queries/content";
import type { CourseListItem } from "@/db/queries/courses";
import type { PageBlock } from "@/db/schema";
import { blockDefinitionMap } from "@/lib/page-blocks";
import {
	FaqBlock,
	ImageTextBlock,
	LogosBlock,
	RichTextBlock,
} from "./content-blocks";

export type PageBlocksData = {
	courses?: CourseListItem[];
	posts?: PostListItem[];
	// Chave de pages.* para o título do "Banner de página".
	pageKey?: string;
	// Pesquisa vinda do URL (/courses?q=...), usada pelo catálogo.
	searchQuery?: string;
};

// Indica que dados da BD os blocos visíveis precisam, para não carregar o que não é usado.
export function blockNeeds(blocks: PageBlock[]) {
	const needs = new Set(
		blocks
			.filter((block) => !block.hidden)
			.map((block) => blockDefinitionMap.get(block.type)?.needs)
	);
	return {
		courses: needs.has("courses"),
		posts: needs.has("posts") || needs.has("allPosts"),
		allPosts: needs.has("allPosts"),
	};
}

const hideClass = {
	mobile: "d-none d-lg-block",
	desktop: "d-lg-none",
};

export function RenderBlock({
	block,
	index,
	courses = [],
	posts = [],
	pageKey = "home",
	searchQuery = "",
}: { block: PageBlock; index: number } & PageBlocksData) {
	const { data } = block;
	switch (block.type) {
		case "hero":
			return <HomeBanner data={data} />;
		case "pageBanner":
			return <Banner data={data} page={pageKey} />;
		case "introStats":
			return <IntroStats data={data} />;
		case "about":
			return <About data={data} />;
		case "featuredPrograms":
			return <FeaturedPrograms data={data} />;
		case "forCompanies":
			return <ForCompanies data={data} />;
		case "trainersHighlight":
			return <TrainersHighlight data={data} />;
		case "futureCta":
			return <FutureCta data={data} />;
		case "categories":
			return <Category data={data} />;
		case "courses":
			return <Courses data={data} courses={courses} />;
		case "catalog":
			return <Catalog key={searchQuery} data={data} courses={courses} initialQuery={searchQuery} />;
		case "counter":
			return <CounterUp data={data} />;
		case "testimonials":
			return <Testimonials data={data} />;
		case "cta":
			return <CTA data={data} />;
		case "latestNews":
			return <NewsCarousel data={data} posts={posts} />;
		case "newsList":
			// A quantidade por carregamento é estado inicial: muda-a, recomeça a lista.
			return <NewsList key={String(data.pageSize ?? "")} data={data} posts={posts} />;
		case "imageText":
			return <ImageTextBlock data={data} />;
		case "richText":
			return <RichTextBlock data={data} />;
		case "video":
			// Sem banner por cima, o primeiro bloco precisa do espaço do cabeçalho.
			return <Video data={data} className={index === 0 ? "working-area-first" : ""} />;
		case "features":
			return <Features data={data} />;
		case "faq":
			return <FaqBlock data={data} />;
		case "logos":
			return <LogosBlock data={data} />;
		case "companyForm":
			return <CompanyFormBlock data={data} />;
		default:
			return null;
	}
}

// Envolve cada bloco com a âncora e a visibilidade por dispositivo definidas no backoffice.
export function BlockShell({
	block,
	children,
	...props
}: { block: PageBlock; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
	const hideOn = block.settings?.hideOn;
	return (
		<div
			id={block.settings?.anchor || undefined}
			className={hideOn ? hideClass[hideOn] : undefined}
			{...props}
		>
			{children}
		</div>
	);
}

export default function PageBlocks({
	blocks,
	...data
}: { blocks: PageBlock[] } & PageBlocksData) {
	const visible = blocks.filter((block) => !block.hidden);
	return (
		<>
			{visible.map((block, index) => (
				<BlockShell key={block.id} block={block}>
					<RenderBlock block={block} index={index} {...data} />
				</BlockShell>
			))}
		</>
	);
}

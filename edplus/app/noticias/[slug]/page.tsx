import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteShell from "@/app/components/site-shell";
import NewsDetails from "@/app/template-parts/news-details";
import { getPublishedPostBySlug } from "@/db/queries/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (!post) return {};
	return {
		title: `${post.title.pt} — Academia Pumangol`,
		description: post.excerpt.pt || undefined,
		openGraph: post.coverImageUrl ? { images: [post.coverImageUrl] } : undefined,
	};
}

export default async function NewsDetailsPage({ params }: Props) {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (!post) notFound();

	return (
		<SiteShell page="news">
			<NewsDetails post={post} />
		</SiteShell>
	);
}

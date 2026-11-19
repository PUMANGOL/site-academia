import Link from "next/link";
import PageHeader from "@/app/backoffice/components/page-header";
import PostsTable from "@/app/backoffice/components/posts-table";
import { getAdminPosts } from "@/db/queries/content";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
	const posts = await getAdminPosts();

	return (
		<div>
			<PageHeader title="Notícias" description="Artigos publicados em /noticias">
				<Link href="/backoffice/noticias/novo" className="admin-btn admin-btn-secondary">
					Nova notícia
				</Link>
			</PageHeader>
			<PostsTable
				posts={posts.map((post) => ({
					id: post.id,
					slug: post.slug,
					titlePt: post.title.pt,
					categoryPt: post.category.pt,
					status: post.status,
					isFeatured: post.isFeatured,
					publishedAt: post.publishedAt,
				}))}
			/>
		</div>
	);
}

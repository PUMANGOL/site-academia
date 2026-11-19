import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/app/backoffice/components/page-header";
import PostForm from "@/app/backoffice/components/post-form";
import { getAdminPost } from "@/db/queries/content";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const post = await getAdminPost(id);
	if (!post) notFound();

	return (
		<div>
			<PageHeader title="Editar notícia" description={post.title.pt}>
				{post.status === "published" ? (
					<Link href={`/noticias/${post.slug}`} className="admin-btn admin-btn-outline">
						Ver no site
					</Link>
				) : null}
			</PageHeader>
			<PostForm
				mode="edit"
				postId={post.id}
				initial={{
					slug: post.slug,
					titlePt: post.title.pt,
					titleEn: post.title.en,
					excerptPt: post.excerpt.pt,
					excerptEn: post.excerpt.en,
					categoryPt: post.category.pt,
					categoryEn: post.category.en,
					bodyPt: post.body.pt,
					bodyEn: post.body.en,
					coverImageUrl: post.coverImageUrl ?? "",
					status: post.status,
					isFeatured: post.isFeatured,
				}}
			/>
		</div>
	);
}

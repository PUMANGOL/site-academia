import PageHeader from "@/app/backoffice/components/page-header";
import PostForm from "@/app/backoffice/components/post-form";

export default function NewPostPage() {
	return (
		<div>
			<PageHeader title="Nova notícia" description="Escrever um artigo para o site" />
			<PostForm mode="create" />
		</div>
	);
}

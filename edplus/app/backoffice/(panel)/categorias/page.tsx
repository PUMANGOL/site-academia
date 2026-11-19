import CategoriesPanel from "@/app/backoffice/components/categories-panel";
import PageHeader from "@/app/backoffice/components/page-header";
import { getAdminCategories } from "@/db/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
	const categories = await getAdminCategories();

	return (
		<div>
			<PageHeader
				title="Categorias"
				description="Organizar formações por área temática"
			/>
			<CategoriesPanel
				categories={categories.map((category) => ({
					id: category.id,
					slug: category.slug,
					namePt: category.name.pt,
					nameEn: category.name.en,
					sortOrder: category.sortOrder,
					isActive: category.isActive,
				}))}
			/>
		</div>
	);
}

import CourseForm from "@/app/backoffice/components/course-form";
import PageHeader from "@/app/backoffice/components/page-header";
import {
	getCategoryOptions,
	getInstructorOptions,
} from "@/db/queries/admin";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
	const [instructors, categories] = await Promise.all([
		getInstructorOptions(),
		getCategoryOptions(),
	]);

	return (
		<div>
			<PageHeader
				title="Novo curso"
				description="Adicionar formação ao catálogo"
			/>
			<CourseForm
				mode="create"
				instructors={instructors.map((i) => ({ id: i.id, label: i.name }))}
				categories={categories.map((c) => ({
					id: c.id,
					label: c.name.pt,
				}))}
			/>
		</div>
	);
}

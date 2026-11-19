import InstructorsPanel from "@/app/backoffice/components/instructors-panel";
import PageHeader from "@/app/backoffice/components/page-header";
import { getAdminInstructors } from "@/db/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage() {
	const instructors = await getAdminInstructors();

	return (
		<div>
			<PageHeader
				title="Instrutores"
				description="Gerir formadores e perfis públicos"
			/>
			<InstructorsPanel
				instructors={instructors.map((instructor) => ({
					id: instructor.id,
					slug: instructor.slug,
					name: instructor.name,
					headlinePt: instructor.headline.pt,
					headlineEn: instructor.headline.en,
					isFeatured: instructor.isFeatured,
				}))}
			/>
		</div>
	);
}

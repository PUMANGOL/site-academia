import { desc, eq } from "drizzle-orm";
import CompanyRequestsTable from "@/app/backoffice/components/company-requests-table";
import PageHeader from "@/app/backoffice/components/page-header";
import { db } from "@/db";
import { companyRequests, user } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function CompanyRequestsPage() {
	const rows = await db
		.select({
			id: companyRequests.id,
			companyName: companyRequests.companyName,
			contactName: companyRequests.contactName,
			jobTitle: companyRequests.jobTitle,
			email: companyRequests.email,
			phone: companyRequests.phone,
			sector: companyRequests.sector,
			participants: companyRequests.participants,
			trainingAreas: companyRequests.trainingAreas,
			modality: companyRequests.modality,
			message: companyRequests.message,
			status: companyRequests.status,
			internalNotes: companyRequests.internalNotes,
			handledByName: user.name,
			createdAt: companyRequests.createdAt,
		})
		.from(companyRequests)
		.leftJoin(user, eq(user.id, companyRequests.handledBy))
		.orderBy(desc(companyRequests.createdAt));

	return (
		<div>
			<PageHeader
				title="Pedidos de empresas"
				description="Pedidos de formação à medida enviados na página Parceiros."
			/>
			<CompanyRequestsTable requests={rows} />
		</div>
	);
}

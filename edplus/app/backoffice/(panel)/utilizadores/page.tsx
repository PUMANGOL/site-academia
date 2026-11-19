import PageHeader from "@/app/backoffice/components/page-header";
import UsersTable from "@/app/backoffice/components/users-table";
import { getAdminUsers } from "@/db/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const [{ funcao }, users] = await Promise.all([
		searchParams,
		getAdminUsers(),
	]);

	return (
		<div>
			<PageHeader
				title="Utilizadores"
				description="Gerir contas e funções de acesso"
			/>
			<UsersTable
				users={users}
				initialRole={typeof funcao === "string" ? funcao : ""}
			/>
		</div>
	);
}

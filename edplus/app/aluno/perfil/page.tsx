import PageHeader from "@/app/backoffice/components/page-header";
import ProfileTabs from "@/app/components/account/profile-tabs";
import { requireUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AlunoPerfilPage() {
	const session = await requireUser();

	return (
		<div>
			<PageHeader title="Perfil" description="Dados pessoais e segurança da conta" />
			<ProfileTabs
				userName={session.user.name}
				userEmail={session.user.email}
				userUsername={(session.user as { username?: string | null }).username}
			/>
		</div>
	);
}

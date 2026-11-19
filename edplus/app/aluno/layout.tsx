import AlunoHeader from "@/app/aluno/components/aluno-header";
import AlunoSidebar from "@/app/aluno/components/aluno-sidebar";
import {
	SidebarBackdrop,
	SidebarShellProvider,
} from "@/app/components/sidebar-shell";
import { requireUser } from "@/lib/admin-auth";

export const metadata = {
	title: {
		template: "%s — Área do Aluno — Academia Pumangol",
		default: "Área do Aluno — Academia Pumangol",
	},
};

export default async function AlunoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await requireUser();

	return (
		<div className="admin-shell admin-layout">
			<SidebarShellProvider>
				<AlunoSidebar />
				<SidebarBackdrop />
				<div className="admin-main">
					<AlunoHeader
						userName={session.user.name}
						userEmail={session.user.email}
					/>
					<main className="admin-content">{children}</main>
				</div>
			</SidebarShellProvider>
			<div id="admin-portal-root" />
		</div>
	);
}

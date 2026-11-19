import AdminHeader from "@/app/backoffice/components/admin-header";
import AdminSidebar from "@/app/backoffice/components/admin-sidebar";
import {
	SidebarBackdrop,
	SidebarShellProvider,
} from "@/app/components/sidebar-shell";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = {
	title: {
		template: "%s — Backoffice Academia Pumangol",
		default: "Backoffice Academia Pumangol",
	},
};

export default async function BackofficePanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await requireAdmin();

	return (
		<div className="admin-shell admin-layout">
			<SidebarShellProvider>
				<AdminSidebar />
				<SidebarBackdrop />
				<div className="admin-main">
					<AdminHeader
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

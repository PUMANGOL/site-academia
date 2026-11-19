import AdminUserMenu from "@/app/backoffice/components/admin-user-menu";
import { SidebarMenuToggle } from "@/app/components/sidebar-shell";
import ThemeSwitcher from "@/app/components/theme-switcher";

type AdminHeaderProps = {
	userName: string;
	userEmail: string;
};

export default function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
	return (
		<header className="admin-header">
			<SidebarMenuToggle />
			<div className="admin-header-actions">
				<ThemeSwitcher />
				<AdminUserMenu userName={userName} userEmail={userEmail} />
			</div>
		</header>
	);
}

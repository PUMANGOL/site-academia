import AlunoUserMenu from "@/app/aluno/components/aluno-user-menu";
import { SidebarMenuToggle } from "@/app/components/sidebar-shell";
import ThemeSwitcher from "@/app/components/theme-switcher";

type AlunoHeaderProps = {
	userName: string;
	userEmail: string;
};

export default function AlunoHeader({ userName, userEmail }: AlunoHeaderProps) {
	return (
		<header className="admin-header">
			<SidebarMenuToggle />
			<div className="admin-header-actions">
				<ThemeSwitcher />
				<AlunoUserMenu userName={userName} userEmail={userEmail} />
			</div>
		</header>
	);
}

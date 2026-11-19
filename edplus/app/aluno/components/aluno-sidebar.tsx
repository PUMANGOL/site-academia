"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogo from "@/app/backoffice/components/admin-logo";
import { useSidebarShell } from "@/app/components/sidebar-shell";

const navItems = [
	{ href: "/aluno", label: "Dashboard", icon: "ph-squares-four" },
	{ href: "/aluno/cursos", label: "Os meus cursos", icon: "ph-book-open" },
	{ href: "/aluno/perfil", label: "Perfil", icon: "ph-user-circle" },
];

export default function AlunoSidebar() {
	const pathname = usePathname();
	const { open, close } = useSidebarShell();

	return (
		<aside className={`admin-sidebar${open ? " is-open" : ""}`}>
			<div className="admin-sidebar-brand">
				<AdminLogo />
				<p className="admin-sidebar-label">Área do Aluno</p>
			</div>

			<nav className="admin-nav">
				{navItems.map((item) => {
					const active =
						item.href === "/aluno"
							? pathname === "/aluno"
							: pathname.startsWith(item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`admin-nav-link${active ? " is-active" : ""}`}
							onClick={close}
						>
							<i className={`ph ${item.icon}`} aria-hidden />
							{item.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}

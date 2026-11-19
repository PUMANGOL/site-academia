"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogo from "./admin-logo";
import { useSidebarShell } from "@/app/components/sidebar-shell";

const navItems = [
	{ href: "/backoffice", label: "Dashboard", icon: "ph-squares-four" },
	{ href: "/backoffice/cursos", label: "Cursos", icon: "ph-book-open" },
	{ href: "/backoffice/categorias", label: "Categorias", icon: "ph-tag" },
	{ href: "/backoffice/instrutores", label: "Instrutores", icon: "ph-chalkboard-teacher" },
	{ href: "/backoffice/paginas", label: "Páginas", icon: "ph-layout" },
	{ href: "/backoffice/noticias", label: "Notícias", icon: "ph-newspaper" },
	{ href: "/backoffice/pedidos", label: "Pedidos de empresas", icon: "ph-buildings" },
	{ href: "/backoffice/utilizadores", label: "Utilizadores", icon: "ph-users" },
	{ href: "/backoffice/relatorios", label: "Relatórios", icon: "ph-microsoft-excel-logo" },
	{ href: "/backoffice/perfil", label: "Perfil", icon: "ph-user-circle" },
];

export default function AdminSidebar() {
	const pathname = usePathname();
	const { open, close } = useSidebarShell();

	return (
		<aside className={`admin-sidebar${open ? " is-open" : ""}`}>
			<div className="admin-sidebar-brand">
				<AdminLogo />
				<p className="admin-sidebar-label">Backoffice</p>
			</div>

			<nav className="admin-nav">
				{navItems.map((item) => {
					const active =
						item.href === "/backoffice"
							? pathname === "/backoffice"
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

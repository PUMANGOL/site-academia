"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/app/providers/cart-provider";

export default function UserMenu() {
	const { t } = useI18n();
	const { data: session, isPending } = authClient.useSession();
	const { refresh } = useCart();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const user = session?.user;
	const role = (user as { role?: string } | undefined)?.role;

	const area =
		role === "admin"
			? { href: "/backoffice", label: t("nav.adminArea") }
			: role === "instructor"
				? { href: "/aluno", label: t("nav.instructorArea") }
				: { href: "/aluno", label: t("nav.studentArea") };

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, []);

	if (isPending) {
		return null;
	}

	if (!user) {
		return (
			<Link
				href="/login"
				className="search_btn align-self-center"
				aria-label={t("nav.login")}
			>
				<i className="ph ph-user"></i>
			</Link>
		);
	}

	return (
		<div className={`user-menu${open ? " is-open" : ""}`} ref={ref}>
			<button
				type="button"
				className="user-menu-toggle"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
			>
				<i className="fa-regular fa-user"></i>
				<span>{user.name}</span>
				<i className="ph ph-caret-down"></i>
			</button>

			{open ? (
				<div className="user-menu-dropdown" role="menu">
					<div className="user-menu-info">
						<strong>{user.name}</strong>
						<span>{user.email}</span>
					</div>
					<Link
						href={area.href}
						className="user-menu-link"
						onClick={() => setOpen(false)}
					>
						{area.label}
					</Link>
					<button
						type="button"
						className="user-menu-logout"
						onClick={async () => {
							setOpen(false);
							await authClient.signOut();
							await refresh();
						}}
					>
						{t("auth.logout")}
					</button>
				</div>
			) : null}
		</div>
	);
}

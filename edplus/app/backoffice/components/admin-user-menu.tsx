"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AdminModal from "@/app/backoffice/components/admin-modal";
import {
	AdminDropdown,
	AdminDropdownItem,
	AdminDropdownLabel,
	AdminDropdownSeparator,
} from "@/app/backoffice/components/admin-dropdown";

type AdminUserMenuProps = {
	userName: string;
	userEmail: string;
};

export default function AdminUserMenu({
	userName,
	userEmail,
}: AdminUserMenuProps) {
	const router = useRouter();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pending, setPending] = useState(false);

	async function handleSignOut() {
		setPending(true);
		await authClient.signOut();
		router.push("/backoffice/login");
		router.refresh();
	}

	return (
		<>
			<AdminDropdown
				trigger={
					<button type="button" className="admin-user-trigger" aria-label="Menu do utilizador">
						{userName}
						<i className="ph ph-caret-down" aria-hidden />
					</button>
				}
			>
				<AdminDropdownLabel title={userName} subtitle={userEmail} />
				<AdminDropdownSeparator />
				<AdminDropdownItem href="/">
					<i className="ph ph-arrow-left" aria-hidden />
					Voltar ao site
				</AdminDropdownItem>
				<AdminDropdownSeparator />
				<AdminDropdownItem danger onSelect={() => setConfirmOpen(true)}>
					<i className="ph ph-sign-out" aria-hidden />
					Terminar sessão
				</AdminDropdownItem>
			</AdminDropdown>

			<AdminModal
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				title="Terminar sessão?"
				footer={
					<>
						<button
							type="button"
							className="admin-btn admin-btn-outline"
							onClick={() => setConfirmOpen(false)}
							disabled={pending}
						>
							Cancelar
						</button>
						<button
							type="button"
							className="admin-btn admin-btn-danger"
							onClick={handleSignOut}
							disabled={pending}
						>
							{pending ? "A terminar..." : "Terminar sessão"}
						</button>
					</>
				}
			>
				<p className="mb-0">
					Vai sair do backoffice e ser redirecionado para a página de login.
				</p>
			</AdminModal>
		</>
	);
}

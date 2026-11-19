"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { banUser, unbanUser, updateUserRole } from "@/app/actions/admin/users";
import {
	promoteUserToInstructor,
	type InstructorFormInput,
} from "@/app/actions/admin/instructors";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import AdminModal from "@/app/backoffice/components/admin-modal";
import {
	AdminFilterBar,
	AdminFilterDateRange,
	AdminFilterEmptyRow,
	AdminFilterSearch,
	AdminFilterSelect,
	emptyDateRange,
	hasDateRange,
	inDateRange,
	matchesSearch,
} from "@/app/backoffice/components/admin-filters";
import {
	AdminDropdown,
	AdminDropdownItem,
	AdminDropdownLabel,
	AdminDropdownSeparator,
} from "@/app/backoffice/components/admin-dropdown";
import type { UserRole } from "@/lib/roles";
import { USER_ROLES } from "@/lib/roles";

function slugify(value: string) {
	return value
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

type UserRow = {
	id: string;
	name: string;
	email: string;
	username: string | null;
	role: string;
	emailVerified: boolean;
	createdAt: Date;
	banned: boolean | null;
	banReason: string | null;
};

const roleLabel: Record<UserRole, string> = {
	student: "Estudante",
	instructor: "Instrutor",
	admin: "Administrador",
};

const roleVariant: Record<UserRole, "default" | "success" | "warning"> = {
	student: "default",
	instructor: "warning",
	admin: "success",
};

const roleOptions = USER_ROLES.map((value) => ({
	value,
	label: roleLabel[value],
}));

const accountOptions = [
	{ value: "active", label: "Ativos" },
	{ value: "banned", label: "Banidos" },
];

const verifiedOptions = [
	{ value: "yes", label: "Verificados" },
	{ value: "no", label: "Não verificados" },
];

export default function UsersTable({
	users,
	initialRole = "",
}: {
	users: UserRow[];
	initialRole?: string;
}) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState(() =>
		roleOptions.some((option) => option.value === initialRole)
			? initialRole
			: ""
	);
	const [accountFilter, setAccountFilter] = useState("");
	const [verifiedFilter, setVerifiedFilter] = useState("");
	const [registered, setRegistered] = useState(emptyDateRange);

	const filtered = users.filter(
		(user) =>
			matchesSearch(search, user.name, user.email, user.username) &&
			(!roleFilter || user.role === roleFilter) &&
			(!accountFilter ||
				(accountFilter === "banned") === Boolean(user.banned)) &&
			(!verifiedFilter || (verifiedFilter === "yes") === user.emailVerified) &&
			inDateRange(user.createdAt, registered)
	);
	const hasFilters =
		Boolean(search || roleFilter || accountFilter || verifiedFilter) ||
		hasDateRange(registered);

	function clearFilters() {
		setSearch("");
		setRoleFilter("");
		setAccountFilter("");
		setVerifiedFilter("");
		setRegistered(emptyDateRange);
	}
	const [pending, startTransition] = useTransition();
	const [promoteTarget, setPromoteTarget] = useState<UserRow | null>(null);
	const [banTarget, setBanTarget] = useState<UserRow | null>(null);
	const [banReason, setBanReason] = useState("");
	const [featured, setFeatured] = useState(false);
	const [error, setError] = useState("");
	const [banError, setBanError] = useState("");

	function handleRoleChange(userId: string, role: UserRole) {
		startTransition(async () => {
			const result = await updateUserRole(userId, role);
			if (!result.ok) {
				alert(result.error);
				return;
			}
			router.refresh();
		});
	}

	function handleUnban(userId: string) {
		startTransition(async () => {
			const result = await unbanUser(userId);
			if (!result.ok) {
				alert(result.error);
				return;
			}
			router.refresh();
		});
	}

	function openBan(target: UserRow) {
		setBanReason("");
		setBanError("");
		setBanTarget(target);
	}

	function confirmBan() {
		if (!banTarget) return;
		const { id } = banTarget;
		startTransition(async () => {
			const result = await banUser(id, banReason);
			if (!result.ok) {
				setBanError(result.error ?? "Não foi possível banir o utilizador.");
				return;
			}
			setBanTarget(null);
			router.refresh();
		});
	}

	function openPromote(target: UserRow) {
		setFeatured(false);
		setError("");
		setPromoteTarget(target);
	}

	async function handlePromoteSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!promoteTarget) return;
		setError("");

		const form = new FormData(event.currentTarget);
		const input: InstructorFormInput = {
			slug: String(form.get("slug") ?? ""),
			name: String(form.get("name") ?? ""),
			headlinePt: String(form.get("headlinePt") ?? ""),
			headlineEn: String(form.get("headlineEn") ?? ""),
			bioPt: String(form.get("bioPt") ?? ""),
			bioEn: String(form.get("bioEn") ?? ""),
			photoUrl: String(form.get("photoUrl") ?? ""),
			isFeatured: featured,
		};

		startTransition(async () => {
			const result = await promoteUserToInstructor(promoteTarget.id, input);
			if (!result.ok) {
				setError(result.error ?? "Erro ao promover utilizador.");
				return;
			}
			setPromoteTarget(null);
			router.refresh();
		});
	}

	return (
		<>
		<AdminFilterBar
			shown={filtered.length}
			total={users.length}
			hasFilters={hasFilters}
			onClear={clearFilters}
		>
			<AdminFilterSearch
				value={search}
				onChange={setSearch}
				placeholder="Pesquisar por nome, email ou utilizador"
			/>
			<AdminFilterSelect
				label="Função"
				value={roleFilter}
				onChange={setRoleFilter}
				options={roleOptions}
				allLabel="Todas"
			/>
			<AdminFilterSelect
				label="Estado"
				value={accountFilter}
				onChange={setAccountFilter}
				options={accountOptions}
			/>
			<AdminFilterSelect
				label="Email"
				value={verifiedFilter}
				onChange={setVerifiedFilter}
				options={verifiedOptions}
			/>
			<AdminFilterDateRange
				label="Data de registo"
				value={registered}
				onChange={setRegistered}
			/>
		</AdminFilterBar>
		<div className="admin-table-wrap">
			<table className="admin-table">
				<thead>
					<tr>
						<th>Nome</th>
						<th>Email</th>
						<th>Utilizador</th>
						<th>Função</th>
						<th>Verificado</th>
						<th>Estado</th>
						<th>Registo</th>
						<th className="text-end">Ações</th>
					</tr>
				</thead>
				<tbody>
					{filtered.length === 0 ? <AdminFilterEmptyRow colSpan={8} /> : null}
					{filtered.map((user) => {
						const role = user.role as UserRole;
						return (
							<tr key={user.id}>
								<td className="fw-medium">{user.name}</td>
								<td>{user.email}</td>
								<td>{user.username ?? "—"}</td>
								<td>
									<AdminBadge variant={roleVariant[role] ?? "default"}>
										{roleLabel[role] ?? user.role}
									</AdminBadge>
								</td>
								<td>
									<AdminBadge variant={user.emailVerified ? "success" : "muted"}>
										{user.emailVerified ? "Sim" : "Não"}
									</AdminBadge>
								</td>
								<td>
									<AdminBadge variant={user.banned ? "danger" : "success"}>
										{user.banned ? "Banido" : "Ativo"}
									</AdminBadge>
								</td>
								<td>
									{new Intl.DateTimeFormat("pt-PT").format(user.createdAt)}
								</td>
								<td className="text-end">
									<AdminDropdown
										trigger={
											<button
												type="button"
												className="admin-btn admin-btn-ghost admin-btn-sm"
												disabled={pending}
											>
												<i className="ph ph-dots-three-outline" aria-hidden />
												<span className="sr-only">Ações</span>
											</button>
										}
									>
										<AdminDropdownLabel title="Alterar função" />
										<AdminDropdownSeparator />
										{USER_ROLES.map((value) => (
											<AdminDropdownItem
												key={value}
												disabled={value === role}
												onSelect={() =>
													value === "instructor"
														? openPromote(user)
														: handleRoleChange(user.id, value)
												}
											>
												<i className="ph ph-shield-check" aria-hidden />
												{roleLabel[value]}
											</AdminDropdownItem>
										))}
										<AdminDropdownSeparator />
										{user.banned ? (
											<AdminDropdownItem onSelect={() => handleUnban(user.id)}>
												<i className="ph ph-lock-open" aria-hidden />
												Reativar
											</AdminDropdownItem>
										) : (
											<AdminDropdownItem danger onSelect={() => openBan(user)}>
												<i className="ph ph-prohibit" aria-hidden />
												Banir
											</AdminDropdownItem>
										)}
									</AdminDropdown>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>

		<AdminModal
			open={promoteTarget !== null}
			onClose={() => setPromoteTarget(null)}
			title="Promover a instrutor"
			size="xl"
			footer={
				<>
					<button
						type="button"
						className="admin-btn admin-btn-outline"
						onClick={() => setPromoteTarget(null)}
					>
						Cancelar
					</button>
					<button
						type="submit"
						form="promote-instructor-form"
						className="admin-btn admin-btn-primary"
						disabled={pending}
					>
						{pending ? "A criar..." : "Criar instrutor"}
					</button>
				</>
			}
		>
			<form
				id="promote-instructor-form"
				onSubmit={handlePromoteSubmit}
				className="admin-form-stack"
			>
				<p className="mb-0">
					Preencha o perfil público de instrutor para{" "}
					<strong>{promoteTarget?.name}</strong>. A função do utilizador só
					muda para Instrutor depois de criado.
				</p>

				<div className="admin-form-grid-3">
					<div>
						<label htmlFor="promote-slug" className="admin-label">
							Slug
						</label>
						<input
							id="promote-slug"
							name="slug"
							defaultValue={promoteTarget ? slugify(promoteTarget.name) : ""}
							placeholder="ex: joao-silva"
							required
							className="admin-input form-control"
						/>
					</div>
					<div>
						<label htmlFor="promote-name" className="admin-label">
							Nome
						</label>
						<input
							id="promote-name"
							name="name"
							defaultValue={promoteTarget?.name}
							placeholder="ex: João Silva"
							required
							className="admin-input form-control"
						/>
					</div>
					<div>
						<label htmlFor="promote-photoUrl" className="admin-label">
							URL da foto
						</label>
						<input
							id="promote-photoUrl"
							name="photoUrl"
							placeholder="https://.../foto.jpg"
							className="admin-input form-control"
						/>
					</div>
					<div>
						<label htmlFor="promote-headlinePt" className="admin-label">
							Headline (PT)
						</label>
						<input
							id="promote-headlinePt"
							name="headlinePt"
							placeholder="ex: Especialista em Segurança e Conformidade HSE"
							required
							className="admin-input form-control"
						/>
					</div>
					<div>
						<label htmlFor="promote-headlineEn" className="admin-label">
							Headline (EN)
						</label>
						<input
							id="promote-headlineEn"
							name="headlineEn"
							placeholder="e.g. Safety & Compliance (HSE) Specialist"
							required
							className="admin-input form-control"
						/>
					</div>
					<div className="admin-form-grid-span-all">
						<label htmlFor="promote-bioPt" className="admin-label">
							Bio (PT)
						</label>
						<textarea
							id="promote-bioPt"
							name="bioPt"
							rows={2}
							placeholder="Breve biografia profissional, experiência e áreas de especialização..."
							className="admin-input form-control"
						/>
					</div>
					<div className="admin-form-grid-span-all">
						<label htmlFor="promote-bioEn" className="admin-label">
							Bio (EN)
						</label>
						<textarea
							id="promote-bioEn"
							name="bioEn"
							rows={2}
							placeholder="Short professional bio, experience and areas of expertise..."
							className="admin-input form-control"
						/>
					</div>
				</div>

				<label className="admin-check-row">
					<input
						className="form-check-input"
						type="checkbox"
						checked={featured}
						onChange={(event) => setFeatured(event.target.checked)}
					/>
					Destaque
				</label>

				{error ? <p className="admin-alert-error mb-0">{error}</p> : null}
			</form>
		</AdminModal>

		<AdminModal
			open={banTarget !== null}
			onClose={() => setBanTarget(null)}
			title="Banir utilizador?"
			footer={
				<>
					<button
						type="button"
						className="admin-btn admin-btn-outline"
						onClick={() => setBanTarget(null)}
						disabled={pending}
					>
						Cancelar
					</button>
					<button
						type="button"
						className="admin-btn admin-btn-danger"
						onClick={confirmBan}
						disabled={pending}
					>
						{pending ? "A banir..." : "Banir"}
					</button>
				</>
			}
		>
			<p>
				O utilizador &quot;{banTarget?.name}&quot; deixará de conseguir iniciar
				sessão e a sessão atual será terminada imediatamente.
			</p>
			<label htmlFor="ban-reason" className="admin-label">
				Motivo (opcional)
			</label>
			<textarea
				id="ban-reason"
				className="admin-input form-control"
				rows={2}
				value={banReason}
				onChange={(event) => setBanReason(event.target.value)}
				placeholder="ex: Violação dos termos de utilização"
			/>
			{banError ? <p className="admin-alert-error mt-2 mb-0">{banError}</p> : null}
		</AdminModal>
		</>
	);
}

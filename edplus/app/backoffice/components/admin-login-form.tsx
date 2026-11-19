"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLogo from "./admin-logo";
import { checkAdminAccess } from "@/app/actions/admin/auth";
import { authClient } from "@/lib/auth-client";
import {
	createLoginSchema,
	fieldErrors,
	firstError,
} from "@/lib/validations/auth";

export default function AdminLoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirect") || "/backoffice";

	const schema = useMemo(() => createLoginSchema(() => ""), []);
	const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
	const [formError, setFormError] = useState("");
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");
		setErrors({});

		const form = new FormData(event.currentTarget);
		const parsed = schema.safeParse({
			identifier: String(form.get("identifier") ?? ""),
			password: String(form.get("password") ?? ""),
			rememberMe: form.get("remember") === "1",
		});

		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			return;
		}

		setPending(true);
		const { identifier, password, rememberMe } = parsed.data;

		const result = identifier.includes("@")
			? await authClient.signIn.email({ email: identifier, password, rememberMe })
			: await authClient.signIn.username({
					username: identifier,
					password,
					rememberMe,
				});

		if (result.error) {
			setPending(false);
			setFormError(result.error.message || "Credenciais inválidas.");
			return;
		}

		const access = await checkAdminAccess();

		if (!access.ok) {
			await authClient.signOut();
			setPending(false);
			setFormError("Acesso reservado a administradores.");
			return;
		}

		router.push(redirectTo);
		router.refresh();
	}

	const identifierError = firstError(errors, "identifier");
	const passwordError = firstError(errors, "password");

	return (
		<div className="admin-login-wrap">
			<div className="admin-login-card">
				<div className="admin-login-head">
					<AdminLogo />
					<h1 className="admin-login-title">Backoffice</h1>
					<p className="admin-login-subtitle">
						Inicie sessão para gerir a Academia Pumangol
					</p>
				</div>

				<form onSubmit={onSubmit} noValidate className="admin-form-stack">
					<div>
						<label htmlFor="identifier" className="admin-label">
							Email ou utilizador
						</label>
						<input
							id="identifier"
							name="identifier"
							type="text"
							autoComplete="username"
							className={`admin-input form-control${identifierError ? " admin-input-error" : ""}`}
							placeholder="admin@pumangol.ao"
						/>
						{identifierError ? (
							<p className="admin-alert-error mt-2 mb-0">{identifierError}</p>
						) : null}
					</div>

					<div>
						<label htmlFor="password" className="admin-label">
							Palavra-passe
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							className={`admin-input form-control${passwordError ? " admin-input-error" : ""}`}
						/>
						{passwordError ? (
							<p className="admin-alert-error mt-2 mb-0">{passwordError}</p>
						) : null}
					</div>

					<label className="admin-check-row">
						<input
							className="form-check-input"
							type="checkbox"
							name="remember"
							value="1"
						/>
						Manter sessão iniciada
					</label>

					{formError ? <p className="admin-alert-error mb-0">{formError}</p> : null}

					<button
						type="submit"
						className="admin-btn admin-btn-primary admin-btn-block"
						disabled={pending}
					>
						{pending ? "A entrar..." : "Entrar"}
					</button>
				</form>
			</div>
		</div>
	);
}

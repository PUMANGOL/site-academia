"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type ProfileTabsProps = {
	userName: string;
	userEmail: string;
	userUsername?: string | null;
};

type Tab = "info" | "security";
type Feedback = { type: "success" | "error"; text: string } | null;

export default function ProfileTabs({
	userName,
	userEmail,
	userUsername,
}: ProfileTabsProps) {
	const [tab, setTab] = useState<Tab>("info");

	return (
		<div className="admin-card">
			<div className="admin-tabs">
				<button
					type="button"
					className={`admin-tab${tab === "info" ? " is-active" : ""}`}
					onClick={() => setTab("info")}
				>
					Dados pessoais
				</button>
				<button
					type="button"
					className={`admin-tab${tab === "security" ? " is-active" : ""}`}
					onClick={() => setTab("security")}
				>
					Segurança
				</button>
			</div>
			<div className="admin-card-body">
				{tab === "info" ? (
					<PersonalInfoForm
						userName={userName}
						userEmail={userEmail}
						userUsername={userUsername}
					/>
				) : (
					<SecurityForm />
				)}
			</div>
		</div>
	);
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
	if (!feedback) return null;
	return (
		<p className={feedback.type === "error" ? "admin-alert-error" : "admin-alert-success"}>
			{feedback.text}
		</p>
	);
}

function PersonalInfoForm({ userName, userEmail, userUsername }: ProfileTabsProps) {
	const router = useRouter();
	const [name, setName] = useState(userName);
	const [pending, setPending] = useState(false);
	const [feedback, setFeedback] = useState<Feedback>(null);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPending(true);
		setFeedback(null);

		const { error } = await authClient.updateUser({ name: name.trim() });
		setPending(false);

		if (error) {
			setFeedback({
				type: "error",
				text: error.message ?? "Não foi possível atualizar os dados.",
			});
			return;
		}

		setFeedback({ type: "success", text: "Dados atualizados com sucesso." });
		router.refresh();
	}

	return (
		<form onSubmit={onSubmit} className="admin-form-stack">
			<div className="admin-form-grid">
				<div>
					<label htmlFor="profile-name" className="admin-label">
						Nome
					</label>
					<input
						id="profile-name"
						className="admin-input form-control"
						value={name}
						onChange={(event) => setName(event.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor="profile-email" className="admin-label">
						Email
					</label>
					<input
						id="profile-email"
						className="admin-input form-control"
						value={userEmail}
						disabled
					/>
				</div>
				{userUsername ? (
					<div>
						<label htmlFor="profile-username" className="admin-label">
							Utilizador
						</label>
						<input
							id="profile-username"
							className="admin-input form-control"
							value={userUsername}
							disabled
						/>
					</div>
				) : null}
			</div>

			<FeedbackMessage feedback={feedback} />

			<button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
				{pending ? "A guardar..." : "Guardar alterações"}
			</button>
		</form>
	);
}

function SecurityForm() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [feedback, setFeedback] = useState<Feedback>(null);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFeedback(null);

		if (newPassword.length < 8) {
			setFeedback({
				type: "error",
				text: "A nova palavra-passe deve ter pelo menos 8 caracteres.",
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			setFeedback({ type: "error", text: "As palavras-passe não coincidem." });
			return;
		}

		setPending(true);
		const { error } = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		});
		setPending(false);

		if (error) {
			setFeedback({
				type: "error",
				text: error.message ?? "Não foi possível alterar a palavra-passe.",
			});
			return;
		}

		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setFeedback({ type: "success", text: "Palavra-passe alterada com sucesso." });
	}

	return (
		<form onSubmit={onSubmit} className="admin-form-stack">
			<div>
				<label htmlFor="current-password" className="admin-label">
					Palavra-passe atual
				</label>
				<input
					id="current-password"
					type="password"
					className="admin-input form-control"
					value={currentPassword}
					onChange={(event) => setCurrentPassword(event.target.value)}
					autoComplete="current-password"
					required
				/>
			</div>

			<div className="admin-form-grid">
				<div>
					<label htmlFor="new-password" className="admin-label">
						Nova palavra-passe
					</label>
					<input
						id="new-password"
						type="password"
						className="admin-input form-control"
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
						autoComplete="new-password"
						minLength={8}
						required
					/>
				</div>
				<div>
					<label htmlFor="confirm-password" className="admin-label">
						Confirmar nova palavra-passe
					</label>
					<input
						id="confirm-password"
						type="password"
						className="admin-input form-control"
						value={confirmPassword}
						onChange={(event) => setConfirmPassword(event.target.value)}
						autoComplete="new-password"
						minLength={8}
						required
					/>
				</div>
			</div>

			<FeedbackMessage feedback={feedback} />

			<button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
				{pending ? "A alterar..." : "Alterar palavra-passe"}
			</button>
		</form>
	);
}

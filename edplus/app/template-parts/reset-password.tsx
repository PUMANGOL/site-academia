"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authClient } from "@/lib/auth-client";

export default function ResetPassword() {
	const { t } = useI18n();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	// O better-auth redirecciona com ?error=INVALID_TOKEN quando o link expirou.
	const invalidLink = !token || searchParams.get("error") !== null;
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [done, setDone] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		const form = new FormData(event.currentTarget);
		const password = String(form.get("password") ?? "");
		const confirm = String(form.get("confirm") ?? "");

		if (!password) return setError(t("auth.validation.passwordRequired"));
		if (password.length < 8) return setError(t("auth.validation.passwordMin"));
		if (password.length > 128) return setError(t("auth.validation.passwordMax"));
		if (password !== confirm) return setError(t("auth.passwordsMismatch"));

		setPending(true);
		const result = await authClient.resetPassword({ newPassword: password, token: token! });
		setPending(false);

		if (result.error) {
			setError(
				result.error.code === "INVALID_TOKEN"
					? t("auth.resetInvalid")
					: result.error.message || t("auth.errorGeneric")
			);
			return;
		}

		setDone(true);
	}

	return (
		<section className="login_register auth-page">
			<div className="container">
				<div className="row">
					<div className="col-xl-5 col-lg-6 col-md-8 mx-auto wow fadeIn">
						<div className="login auth-card">
							{invalidLink ? (
								<div className="auth-card-status">
									<span className="auth-card-icon is-warning">
										<i className="ph ph-link-break"></i>
									</span>
									<h4 className="auth-card-title">{t("auth.resetInvalidTitle")}</h4>
									<p className="auth-card-text">{t("auth.resetInvalid")}</p>
									<Link href="/recuperar-password" className="blue_btn round_btn btn-brand-dark">
										{t("auth.requestNewLink")} <i className="ph ph-arrow-right"></i>
									</Link>
								</div>
							) : done ? (
								<div className="auth-card-status">
									<span className="auth-card-icon is-success">
										<i className="ph ph-check-circle"></i>
									</span>
									<h4 className="auth-card-title">{t("auth.resetDoneTitle")}</h4>
									<p className="auth-card-text">{t("auth.resetDone")}</p>
									<Link href="/login" className="blue_btn round_btn btn-brand-dark">
										{t("auth.signIn")} <i className="ph ph-arrow-right"></i>
									</Link>
								</div>
							) : (
								<>
									<div className="auth-card-head">
										<span className="auth-card-icon">
											<i className="ph ph-key"></i>
										</span>
										<h4 className="auth-card-title">{t("auth.resetTitle")}</h4>
										<p className="auth-card-text">{t("auth.resetText")}</p>
									</div>

									<form onSubmit={onSubmit} noValidate>
										<div className="form-group mb-4">
											<label htmlFor="reset-password">
												{t("auth.newPassword")}
												<span>*</span>
											</label>
											<input
												type="password"
												id="reset-password"
												name="password"
												placeholder={t("auth.passwordPlaceholder")}
												className="form-control"
												autoComplete="new-password"
											/>
										</div>

										<div className="form-group mb-4">
											<label htmlFor="reset-confirm">
												{t("auth.confirmPassword")}
												<span>*</span>
											</label>
											<input
												type="password"
												id="reset-confirm"
												name="confirm"
												className="form-control"
												autoComplete="new-password"
											/>
										</div>

										{error ? <div className="auth-card-alert">{error}</div> : null}

										<button className="blue_btn round_btn btn-brand-dark" type="submit" disabled={pending}>
											{pending ? t("auth.resetting") : t("auth.resetSubmit")}{" "}
											<i className="ph ph-arrow-right"></i>
										</button>
									</form>
								</>
							)}

							{done ? null : (
								<div className="auth-card-footer">
									<Link href="/login">
										<i className="ph ph-arrow-left"></i> {t("auth.backToLogin")}
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

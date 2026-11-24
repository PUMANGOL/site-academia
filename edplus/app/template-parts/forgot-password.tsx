"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authClient } from "@/lib/auth-client";

export default function ForgotPassword() {
	const { t } = useI18n();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [sent, setSent] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
		if (!email) {
			setError(t("auth.validation.emailRequired"));
			return;
		}
		if (!z.email().safeParse(email).success) {
			setError(t("auth.validation.emailInvalid"));
			return;
		}

		setPending(true);
		const result = await authClient.requestPasswordReset({
			email,
			redirectTo: "/redefinir-password",
		});
		setPending(false);

		if (result.error) {
			setError(result.error.message || t("auth.errorGeneric"));
			return;
		}

		// Mesma mensagem exista ou não a conta, para não revelar que e-mails estão registados.
		setSent(true);
	}

	return (
		<section className="login_register auth-page">
			<div className="container">
				<div className="row">
					<div className="col-xl-5 col-lg-6 col-md-8 mx-auto wow fadeIn">
						<div className="login auth-card">
							{sent ? (
								<div className="auth-card-status">
									<span className="auth-card-icon is-success">
										<i className="ph ph-envelope-simple-open"></i>
									</span>
									<h4 className="auth-card-title">{t("auth.forgotSentTitle")}</h4>
									<p className="auth-card-text">{t("auth.forgotSent")}</p>
								</div>
							) : (
								<>
									<div className="auth-card-head">
										<span className="auth-card-icon">
											<i className="ph ph-lock-key"></i>
										</span>
										<h4 className="auth-card-title">{t("auth.forgotTitle")}</h4>
										<p className="auth-card-text">{t("auth.forgotText")}</p>
									</div>

									<form onSubmit={onSubmit} noValidate>
										<div className="form-group mb-4">
											<label htmlFor="forgot-email">
												{t("auth.email")}
												<span>*</span>
											</label>
											<input
												type="email"
												id="forgot-email"
												name="email"
												placeholder={t("auth.emailPlaceholder")}
												className={`form-control${error ? " is-invalid" : ""}`}
												autoComplete="email"
											/>
											{error ? (
												<small className="text-danger d-block mt-1">{error}</small>
											) : null}
										</div>

										<button className="blue_btn round_btn btn-brand-dark" type="submit" disabled={pending}>
											{pending ? t("auth.sending") : t("auth.sendLink")}{" "}
											<i className="ph ph-arrow-right"></i>
										</button>
									</form>
								</>
							)}

							<div className="auth-card-footer">
								<Link href="/login">
									<i className="ph ph-arrow-left"></i> {t("auth.backToLogin")}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

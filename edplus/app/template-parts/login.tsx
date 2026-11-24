"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/app/providers/cart-provider";
import {
	createLoginSchema,
	fieldErrors,
	firstError,
} from "@/lib/validations/auth";

export default function Login() {
	const { t } = useI18n();
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirect") || "/";
	const { refresh } = useCart();
	const schema = useMemo(() => createLoginSchema(t), [t]);
	const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
		{}
	);
	const [formError, setFormError] = useState("");
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");
		setErrors({});

		const form = new FormData(event.currentTarget);
		const parsed = schema.safeParse({
			identifier: String(form.get("name") ?? ""),
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
			? await authClient.signIn.email({
					email: identifier,
					password,
					rememberMe,
				})
			: await authClient.signIn.username({
					username: identifier,
					password,
					rememberMe,
				});

		setPending(false);

		if (result.error) {
			setFormError(result.error.message || t("auth.errorGeneric"));
			return;
		}

		await refresh();
		router.push(redirectTo);
		router.refresh();
	}

	const identifierError = firstError(errors, "identifier");
	const passwordError = firstError(errors, "password");

	return (
		<section className="login_register auth-page">
			<div className="container">
				<div className="row">
					<div className="col-xl-6 mx-auto wow fadeIn">
						<div className="login auth-card">
							<h4 className="login_register_title">
								{t("auth.loginTitle")}
							</h4>

							<form onSubmit={onSubmit} noValidate>
								<div className="form-group mb-4">
									<label htmlFor="contact-name">
										{t("auth.username")}
										<span>*</span>
									</label>

									<input
										type="text"
										id="contact-name"
										name="name"
										placeholder={t("auth.usernamePlaceholder")}
										className={`form-control${identifierError ? " is-invalid" : ""}`}
										autoComplete="username"
									/>
									{identifierError ? (
										<small className="text-danger d-block mt-1">
											{identifierError}
										</small>
									) : null}
								</div>

								<div className="form-group mb-4">
									<label htmlFor="contact-email">
										{t("auth.password")}
										<span>*</span>
									</label>

									<input
										type="password"
										id="contact-email"
										name="password"
										placeholder={t("auth.passwordPlaceholder")}
										className={`form-control${passwordError ? " is-invalid" : ""}`}
										autoComplete="current-password"
									/>
									{passwordError ? (
										<small className="text-danger d-block mt-1">
											{passwordError}
										</small>
									) : null}
								</div>

								<div className="d-flex flex-wrap justify-content-between gap-2 mb-4">
									<div className="form-check">
										<input
											id="rpaword"
											name="remember"
											value="1"
											className="form-check-input"
											type="checkbox"
										/>

										<label className="form-check-label" htmlFor="rpaword">
											{t("auth.rememberMe")}
										</label>
									</div>

									<Link href="/recuperar-password">{t("auth.forgotLink")}</Link>
								</div>

								{formError ? (
									<p className="text-danger mb-3">{formError}</p>
								) : null}

								<div className="form-group col-lg-12">
									<button
										className="blue_btn round_btn btn-brand-dark"
										type="submit"
										name="submit"
										disabled={pending}
									>
										{pending ? t("auth.signingIn") : t("auth.signIn")}{" "}
										<i className="ph ph-arrow-right"></i>
									</button>
								</div>
							</form>

							<p>
								{t("auth.noAccount")}{" "}
								<Link href="/register">{t("auth.registerNow")}</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

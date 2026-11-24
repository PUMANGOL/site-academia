"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/app/providers/cart-provider";
import {
	createRegisterSchema,
	fieldErrors,
	firstError,
} from "@/lib/validations/auth";

export default function RegisterPage() {
	const { t } = useI18n();
	const router = useRouter();
	const { refresh } = useCart();
	const schema = useMemo(() => createRegisterSchema(t), [t]);
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
			username: String(form.get("username") ?? ""),
			fullname: String(form.get("fullname") ?? ""),
			email: String(form.get("email") ?? ""),
			password: String(form.get("password") ?? ""),
		});

		if (!parsed.success) {
			setErrors(fieldErrors(parsed.error));
			return;
		}

		setPending(true);
		const { username, fullname, email, password } = parsed.data;

		const result = await authClient.signUp.email({
			email,
			password,
			name: fullname || username,
			username,
		});

		setPending(false);

		if (result.error) {
			setFormError(result.error.message || t("auth.errorGeneric"));
			return;
		}

		await refresh();
		router.push("/");
		router.refresh();
	}

	const usernameError = firstError(errors, "username");
	const fullnameError = firstError(errors, "fullname");
	const emailError = firstError(errors, "email");
	const passwordError = firstError(errors, "password");

	return (
		<section className="login_register auth-page">
			<div className="container">
				<div className="row">
					<div className="col-xl-6 mx-auto wow fadeIn">
						<div className="register auth-card">
							<h4 className="login_register_title">
								{t("auth.registerTitle")}
							</h4>

							<form onSubmit={onSubmit} noValidate>
								<div className="form-group">
									<label htmlFor="username">
										{t("auth.username")}
										<span>*</span>
									</label>

									<input
										type="text"
										id="username"
										name="username"
										className={`form-control${usernameError ? " is-invalid" : ""}`}
										placeholder={t("auth.usernameEnter")}
										autoComplete="username"
									/>
									{usernameError ? (
										<small className="text-danger d-block mt-1">
											{usernameError}
										</small>
									) : null}
								</div>

								<div className="form-group">
									<label htmlFor="fullname">{t("auth.fullName")}</label>

									<input
										type="text"
										id="fullname"
										name="fullname"
										className={`form-control${fullnameError ? " is-invalid" : ""}`}
										placeholder={t("auth.fullNamePlaceholder")}
										autoComplete="name"
									/>
									{fullnameError ? (
										<small className="text-danger d-block mt-1">
											{fullnameError}
										</small>
									) : null}
								</div>

								<div className="form-group">
									<label htmlFor="email-address">
										{t("auth.email")}
										<span>*</span>
									</label>

									<input
										type="email"
										id="email-address"
										name="email"
										className={`form-control${emailError ? " is-invalid" : ""}`}
										placeholder={t("auth.emailPlaceholder")}
										autoComplete="email"
									/>
									{emailError ? (
										<small className="text-danger d-block mt-1">
											{emailError}
										</small>
									) : null}
								</div>

								<div className="form-group">
									<label htmlFor="cpwd">
										{t("auth.password")}
										<span>*</span>
									</label>

									<input
										type="password"
										id="cpwd"
										name="password"
										className={`form-control${passwordError ? " is-invalid" : ""}`}
										placeholder={t("auth.passwordPlaceholder")}
										autoComplete="new-password"
									/>
									{passwordError ? (
										<small className="text-danger d-block mt-1">
											{passwordError}
										</small>
									) : null}
								</div>

								{formError ? (
									<p className="text-danger mb-3">{formError}</p>
								) : null}

								<div className="form-group col-lg-12">
									<button
										type="submit"
										name="submit"
										className="blue_btn round_btn btn-brand-dark"
										disabled={pending}
									>
										{pending
											? t("auth.registering")
											: t("auth.freeRegistration")}{" "}
										<i className="ph ph-arrow-right"></i>
									</button>
								</div>
							</form>

							<p>
								{t("auth.haveAccount")}{" "}
								<Link href="/login">{t("auth.loginLink")}</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

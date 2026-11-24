"use client";

import Link from "next/link";
import { FormEvent, useId, useState, useTransition } from "react";
import BrandMark from "@/app/components/brand-mark";
import { submitCompanyRequest } from "@/app/actions/company-requests";
import { useI18n } from "@/app/i18n/I18nProvider";

const WHATSAPP = "https://wa.me/244923000000";

const PROFILES = ["company", "professional", "individual"] as const;
const INTERESTS = ["safety", "leadership", "commercial", "finance", "digital"] as const;
const SIZES = [
	{ value: "10", labelKey: "size10" },
	{ value: "50", labelKey: "size50" },
	{ value: "200", labelKey: "size200" },
	{ value: "201", labelKey: "sizeMore" },
] as const;

type Profile = (typeof PROFILES)[number];

export default function LeadContact() {
	const { t } = useI18n();
	const id = useId();
	const [profile, setProfile] = useState<Profile>("company");
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState("");
	const [sentTo, setSentTo] = useState<string | null>(null);
	const [consentBefore, consentAfter] = t("leadContact.consent").split("{link}");

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		const value = (name: string) => String(form.get(name) ?? "").trim();
		const companyName =
			value("companyName") ||
			(profile === "company" ? "" : t(`leadContact.${profile}`));
		if (profile === "company" && companyName.length < 2) {
			setError(t("leadContact.companyRequired"));
			return;
		}
		setError("");
		startTransition(async () => {
			const result = await submitCompanyRequest({
				companyName,
				contactName: value("contactName"),
				jobTitle: t(`leadContact.${profile}`),
				email: value("email"),
				phone: value("phone"),
				sector: value("interest"),
				participants: value("participants"),
				trainingAreas: value("interest"),
				modality: "undecided",
				message: value("message"),
				privacyConsent: (form.get("privacyConsent") === "on") as true,
				website: value("website"),
			});
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setSentTo(value("email"));
			formElement.reset();
			setProfile("company");
		});
	}

	const field = (name: string) => `${id}-${name}`;

	return (
		<section id="contacto" className="ap-lead ap-stack">
			<div className="container">
				<div className="ap-lead-grid">
					<div className="ap-lead-copy">
						<div className="section-title mb-0">
							<span>
								<BrandMark />
								{t("leadContact.eyebrow")}
							</span>
							<h2>
								{t("leadContact.title")}{" "}
								<span className="ap-hl ap-hl-strong">{t("leadContact.highlight")}</span>
							</h2>
						</div>
						<p>{t("leadContact.text")}</p>
						<div className="ap-lead-meta">
							<Link href="/contact" className="ap-lead-more">
								{t("leadContact.more")}
								<i className="ph ph-arrow-right" aria-hidden />
							</Link>
							<span>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ap-accent, var(--ap-pumangol))" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
									<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
									<circle cx="12" cy="10" r="2.5" />
								</svg>
								{t("leadContact.location")}
							</span>
							<a href={`mailto:${t("leadContact.email")}`}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ap-accent, var(--ap-pumangol))" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
									<rect x="2" y="4" width="20" height="16" rx="3" />
									<path d="M22 6l-10 7L2 6" />
								</svg>
								{t("leadContact.email")}
							</a>
							<a href="tel:+244923000000">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ap-accent, var(--ap-pumangol))" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
									<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
								</svg>
								{t("leadContact.phone")}
							</a>
						</div>
					</div>

					<div className="ap-lead-card">
						{sentTo ? (
							<div className="ap-lead-success" role="status">
								<h3>{t("partners.successTitle")}</h3>
								<p>{t("partners.successText", { email: sentTo })}</p>
								<button type="button" className="blue_btn round_btn btn-brand-dark" onClick={() => setSentTo(null)}>
									{t("partners.another")}
								</button>
							</div>
						) : (
							<form onSubmit={onSubmit}>
								<div className="ap-lead-card-head">
									<div>
										<h3>{t("leadContact.formTitle")}</h3>
										<p>{t("leadContact.formHint")}</p>
									</div>
									<a href={WHATSAPP} className="ap-lead-wa" target="_blank" rel="noreferrer">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
											<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z" />
										</svg>
										{t("leadContact.whatsapp")}
									</a>
								</div>

								<div className="company-request-trap" aria-hidden="true">
									<label htmlFor={field("website")}>Website</label>
									<input id={field("website")} name="website" tabIndex={-1} autoComplete="off" />
								</div>

								<div className="ap-lead-field">
									<span className="lbl">{t("leadContact.profile")}</span>
									<div className="ap-lead-pills" role="group" aria-label={t("leadContact.profile")}>
										{PROFILES.map((item) => (
											<button
												key={item}
												type="button"
												className={item === profile ? "is-on" : undefined}
												onClick={() => setProfile(item)}
											>
												{t(`leadContact.${item}`)}
											</button>
										))}
									</div>
								</div>

								<div className="ap-lead-fields">
									<div>
										<label className="lbl" htmlFor={field("contactName")}>
											{t("leadContact.name")}
										</label>
										<input
											id={field("contactName")}
											name="contactName"
											className="fld"
											required
											minLength={2}
											maxLength={180}
											autoComplete="name"
											placeholder={t("leadContact.namePh")}
										/>
									</div>
									<div>
										<label className="lbl" htmlFor={field("companyName")}>
											{t("leadContact.companyLabel")}
										</label>
										<input
											id={field("companyName")}
											name="companyName"
											className="fld"
											maxLength={180}
											autoComplete="organization"
											placeholder={t("leadContact.companyPh")}
											required={profile === "company"}
										/>
									</div>
									<div>
										<label className="lbl" htmlFor={field("email")}>
											{t("leadContact.emailLabel")}
										</label>
										<input
											id={field("email")}
											name="email"
											type="email"
											className="fld"
											required
											maxLength={320}
											autoComplete="email"
											placeholder={t("leadContact.emailPh")}
										/>
									</div>
									<div>
										<label className="lbl" htmlFor={field("phone")}>
											{t("leadContact.phoneLabel")}
										</label>
										<input
											id={field("phone")}
											name="phone"
											type="tel"
											className="fld"
											maxLength={40}
											autoComplete="tel"
											placeholder={t("leadContact.phonePh")}
										/>
									</div>
									<div>
										<label className="lbl" htmlFor={field("interest")}>
											{t("leadContact.interest")}
										</label>
										<select id={field("interest")} name="interest" className="fld" required>
											{INTERESTS.map((item) => (
												<option key={item} value={t(`leadContact.i_${item}`)}>
													{t(`leadContact.i_${item}`)}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="lbl" htmlFor={field("participants")}>
											{t("leadContact.headcount")}
										</label>
										<select id={field("participants")} name="participants" className="fld" defaultValue="10">
											{SIZES.map((item) => (
												<option key={item.value} value={item.value}>
													{t(`leadContact.${item.labelKey}`)}
												</option>
											))}
										</select>
									</div>
								</div>

								<div className="ap-lead-field">
									<label className="lbl" htmlFor={field("message")}>
										{t("leadContact.message")}
									</label>
									<textarea
										id={field("message")}
										name="message"
										className="fld"
										maxLength={4000}
										placeholder={t("leadContact.messagePh")}
									/>
								</div>

								<label className="ap-lead-consent">
									<input type="checkbox" name="privacyConsent" required />
									<span>
										{consentBefore}
										<Link href="/privacidade" target="_blank">
											{t("leadContact.consentLink")}
										</Link>
										{consentAfter}
									</span>
								</label>

								{error ? (
									<p className="ap-lead-error" role="alert">
										{error}
									</p>
								) : null}

								<button type="submit" className="ap-lead-submit" disabled={pending}>
									{pending ? t("leadContact.sending") : t("leadContact.submit")}
									<i className="ph ph-arrow-right" aria-hidden />
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

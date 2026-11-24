"use client";

import Link from "next/link";
import { FormEvent, useId, useState, useTransition } from "react";
import { submitCompanyRequest } from "@/app/actions/company-requests";
import { useBlockContent, type BlockData } from "./use-block-content";

const MODALITIES = ["undecided", "in_person", "online", "hybrid"] as const;

// Bloco "Formulário de empresas": apresentação à esquerda, pedido de formação à direita.
export default function CompanyFormBlock({ data }: { data?: BlockData }) {
	const { t, text, list, itemText } = useBlockContent("companyForm", data);
	const id = useId();
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState("");
	const [sentTo, setSentTo] = useState<string | null>(null);
	const benefits = list("benefits").map((item) => itemText(item, "text")).filter(Boolean);
	const [consentBefore, consentAfter] = t("partners.consent").split("{link}");

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		const value = (name: string) => String(form.get(name) ?? "");
		setError("");
		startTransition(async () => {
			const result = await submitCompanyRequest({
				companyName: value("companyName"),
				contactName: value("contactName"),
				jobTitle: value("jobTitle"),
				email: value("email"),
				phone: value("phone"),
				sector: value("sector"),
				participants: value("participants"),
				trainingAreas: value("trainingAreas"),
				modality: value("modality") as (typeof MODALITIES)[number],
				message: value("message"),
				// O servidor recusa o pedido se não for true.
				privacyConsent: (form.get("privacyConsent") === "on") as true,
				website: value("website"),
			});
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setSentTo(value("email"));
			formElement.reset();
		});
	}

	const field = (name: string) => `${id}-${name}`;

	return (
		<section className="company-request section-padding">
			<div className="container">
				<div className="row gy-5">
					<div className="col-lg-5">
						<div className="section-title mb-4">
							<span>{text("eyebrow")}</span>
							<h2>{text("title")}</h2>
						</div>
						<p className="company-request-lead">{text("lead")}</p>
						{benefits.length ? (
							<ul className="company-request-benefits">
								{benefits.map((benefit, index) => (
									<li key={index}>
										<i className="ph ph-check-circle" aria-hidden />
										<span>{benefit}</span>
									</li>
								))}
							</ul>
						) : null}
					</div>

					<div className="col-lg-7">
						<div className="company-request-card">
							{sentTo ? (
								<div className="company-request-success" role="status">
									<i className="ph ph-check-circle" aria-hidden />
									<h3>{t("partners.successTitle")}</h3>
									<p>{t("partners.successText", { email: sentTo })}</p>
									<button type="button" className="blue_btn round_btn btn-brand-dark" onClick={() => setSentTo(null)}>
										{t("partners.another")}
									</button>
								</div>
							) : (
								<form onSubmit={onSubmit} noValidate={false}>
									<h3>{text("formTitle")}</h3>
									<p className="company-request-hint">{text("formText")}</p>

									{/* Campo-armadilha para robôs: escondido de pessoas e leitores de ecrã. */}
									<div className="company-request-trap" aria-hidden="true">
										<label htmlFor={field("website")}>Website</label>
										<input id={field("website")} name="website" tabIndex={-1} autoComplete="off" />
									</div>

									<div className="row g-3">
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("companyName")}>{t("partners.companyName")}</label>
											<input id={field("companyName")} name="companyName" className="form-control" required minLength={2} maxLength={180} autoComplete="organization" />
										</div>
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("sector")}>{t("partners.sector")}</label>
											<input id={field("sector")} name="sector" className="form-control" maxLength={120} />
										</div>
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("contactName")}>{t("partners.contactName")}</label>
											<input id={field("contactName")} name="contactName" className="form-control" required minLength={2} maxLength={180} autoComplete="name" />
										</div>
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("jobTitle")}>{t("partners.jobTitle")}</label>
											<input id={field("jobTitle")} name="jobTitle" className="form-control" maxLength={120} autoComplete="organization-title" />
										</div>
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("email")}>{t("partners.email")}</label>
											<input id={field("email")} name="email" type="email" className="form-control" required maxLength={320} autoComplete="email" />
										</div>
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("phone")}>{t("partners.phone")}</label>
											<input id={field("phone")} name="phone" type="tel" className="form-control" maxLength={40} autoComplete="tel" />
										</div>
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("participants")}>{t("partners.participants")}</label>
											<input id={field("participants")} name="participants" type="number" min={1} max={10000} className="form-control" />
										</div>
										<div className="col-md-6">
											<label className="form-label" htmlFor={field("modality")}>{t("partners.modality")}</label>
											<select id={field("modality")} name="modality" className="form-select" defaultValue="undecided">
												{MODALITIES.map((modality) => (
													<option key={modality} value={modality}>
														{t(`partners.modalities.${modality}`)}
													</option>
												))}
											</select>
										</div>
										<div className="col-12">
											<label className="form-label" htmlFor={field("trainingAreas")}>{t("partners.trainingAreas")}</label>
											<textarea
												id={field("trainingAreas")}
												name="trainingAreas"
												className="form-control"
												rows={3}
												required
												minLength={3}
												maxLength={2000}
												aria-describedby={field("trainingAreasHint")}
											/>
											<p id={field("trainingAreasHint")} className="company-request-hint mb-0">
												{t("partners.trainingAreasHint")}
											</p>
										</div>
										<div className="col-12">
											<label className="form-label" htmlFor={field("message")}>{t("partners.message")}</label>
											<textarea id={field("message")} name="message" className="form-control" rows={3} maxLength={4000} />
										</div>
										<div className="col-12">
											<div className="form-check">
												<input id={field("privacyConsent")} name="privacyConsent" type="checkbox" className="form-check-input" required />
												<label className="form-check-label" htmlFor={field("privacyConsent")}>
													{consentBefore}
													<Link href="/privacidade" target="_blank">
														{t("partners.consentLink")}
													</Link>
													{consentAfter}
												</label>
											</div>
										</div>
									</div>

									{error ? (
										<p className="company-request-error" role="alert">
											{error}
										</p>
									) : null}

									<button type="submit" className="blue_btn round_btn btn-brand-dark mt-4" disabled={pending}>
										<span>{pending ? t("partners.sending") : t("partners.submit")}</span>
										<i className="ph ph-paper-plane-tilt" aria-hidden />
									</button>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

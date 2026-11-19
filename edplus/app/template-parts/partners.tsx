"use client";

import ContentPage from "@/app/template-parts/content-page";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function PartnersContent() {
	const { t } = useI18n();
	return (
		<ContentPage
			eyebrow={t("partners.eyebrow")}
			title={t("partners.title")}
			lead={t("partners.lead")}
			paragraphs={[t("partners.p1"), t("partners.p2"), t("partners.p3")]}
			ctaHref="/contact"
			ctaLabel={t("partners.cta")}
		/>
	);
}

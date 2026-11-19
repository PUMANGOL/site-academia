"use client";

import { legalDocuments } from "@/app/content/legal-documents";
import { useI18n } from "@/app/i18n/I18nProvider";
import LegalDocumentView from "@/app/template-parts/legal-document";

export default function PrivacyContent() {
	const { locale } = useI18n();
	return <LegalDocumentView document={legalDocuments[locale].privacy} />;
}

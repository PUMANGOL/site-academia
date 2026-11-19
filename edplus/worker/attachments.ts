import type { EmailJobPayloads } from "@/lib/mail/jobs";
import type { MailAttachment } from "@/lib/mail/templates";
import { catalogAttachment } from "./catalog-pdf";
import { receiptAttachments } from "./receipt-pdf";
import { reportAttachment } from "./reports";

// Anexos gerados pelo worker para cada tipo de email.
export async function emailJobAttachments(
	template: string,
	to: string,
	payload: unknown
): Promise<MailAttachment[]> {
	switch (template) {
		case "enrollment_confirmation":
			return receiptAttachments(to, payload as EmailJobPayloads["enrollment_confirmation"]);
		case "catalog":
			return [await catalogAttachment()];
		case "admin_report":
			return [await reportAttachment(payload as EmailJobPayloads["admin_report"])];
		default:
			return [];
	}
}
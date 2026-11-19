import type { Locale } from "@/app/i18n/messages";
import type { Localized } from "@/db/schema";

export function pickLocale(value: Localized | null | undefined, locale: Locale) {
	if (!value) return "";
	return value[locale] || value.pt || value.en || "";
}

export function formatPrice(amount: string | number, currency = "AOA") {
	const value = typeof amount === "string" ? Number(amount) : amount;
	if (Number.isNaN(value)) return "0 Kz";

	const formatted = new Intl.NumberFormat("pt-PT", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);

	if (currency === "USD") {
		return `$${value.toFixed(2)}`;
	}

	return `${formatted} Kz`;
}

export type CoursePricing = {
	isFree: boolean;
	// Sem preço publicado: o catálogo 2026 confirma valores com a equipa de formação.
	onRequest: boolean;
	// Preço a cobrar: 0 quando o curso é gratuito ou sob consulta.
	price: number;
	// Preço riscado (compare_at_price), só quando é superior ao preço a cobrar.
	originalPrice: number | null;
};

export function getCoursePricing(course: {
	price: string | number;
	compareAtPrice: string | number | null;
	isFree: boolean;
}): CoursePricing {
	const listed = Number(course.price);
	const isFree = course.isFree;
	const onRequest = !isFree && !(listed > 0);
	const price = isFree || onRequest ? 0 : listed;
	const compareAt =
		course.compareAtPrice === null ? NaN : Number(course.compareAtPrice);

	return {
		isFree,
		onRequest,
		price,
		originalPrice: !onRequest && compareAt > price ? compareAt : null,
	};
}

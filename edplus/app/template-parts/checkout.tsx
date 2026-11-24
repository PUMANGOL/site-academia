"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";
import { useCart } from "@/app/providers/cart-provider";
import { formatPrice, pickLocale } from "@/lib/i18n-content";
import { createOrder, simulatePayment, type OrderView } from "@/app/actions/checkout";

type Step = "summary" | "reference" | "success";

export default function CheckoutPage() {
	const { t, locale } = useI18n();
	const { cart, loading, refresh } = useCart();
	const [step, setStep] = useState<Step>("summary");
	const [order, setOrder] = useState<OrderView | null>(null);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	const [copiedField, setCopiedField] = useState<"entity" | "reference" | null>(null);

	async function handleProceed() {
		setPending(true);
		setError("");
		const result = await createOrder();
		setPending(false);

		if (!result.ok) {
			setError(result.error ?? "Erro ao iniciar o pagamento.");
			return;
		}

		setOrder(result.order);
		setStep("reference");
	}

	async function handleSimulate() {
		if (!order) return;
		setPending(true);
		setError("");
		const result = await simulatePayment(order.id);
		setPending(false);

		if (!result.ok) {
			setError(result.error ?? "Erro ao confirmar o pagamento.");
			return;
		}

		setOrder(result.order);
		setStep("success");
		await refresh();
	}

	async function handleCopyField(field: "entity" | "reference", value: string) {
		await navigator.clipboard.writeText(value);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	}

	const totalLabel = order ? formatPrice(order.total, order.currency) : formatPrice(cart.subtotal);

	return (
		<section className="shop checkout section-padding">
			<div className="container">
				<div className="row">
					<div className="col-lg-7 col-12 wow fadeInUp">
						{step === "summary" ? (
							!loading && cart.items.length === 0 ? (
								<div className="checkout-form">
									<p className="mb-3">{t("checkout.empty")}</p>
									<Link href="/courses" className="blue_btn round_btn btn-brand-dark">
										{t("checkout.browseCourses")}
									</Link>
								</div>
							) : (
								<div className="checkout-form">
									<h2>{t("checkout.cartTotal")}</h2>
									<ul className="checkout-review-list">
										{cart.items.map((item) => (
											<li key={item.id}>
												<span>{pickLocale(item.title, locale)}</span>
												<span>{formatPrice(item.lineTotal, item.currency)}</span>
											</li>
										))}
									</ul>
								</div>
							)
						) : null}

						{step === "reference" && order ? (
							<div className="checkout-form">
								<h2>{t("checkout.paymentTitle")}</h2>
								<p>{t("checkout.paymentIntro")}</p>

								<div className="payment-reference-grid">
									<div className="payment-reference-item">
										<span>{t("checkout.entity")}</span>
										<div className="payment-reference-value">
											<strong>{order.paymentEntity}</strong>
											<button
												type="button"
												className="payment-reference-copy-icon"
												onClick={() => handleCopyField("entity", order.paymentEntity)}
												aria-label={`${t("checkout.copy")} ${t("checkout.entity")}`}
											>
												<i
													className={copiedField === "entity" ? "ph ph-check" : "ph ph-copy"}
													aria-hidden
												/>
											</button>
										</div>
									</div>
									<div className="payment-reference-item">
										<span>{t("checkout.reference")}</span>
										<div className="payment-reference-value">
											<strong>{order.paymentReference}</strong>
											<button
												type="button"
												className="payment-reference-copy-icon"
												onClick={() => handleCopyField("reference", order.paymentReference)}
												aria-label={`${t("checkout.copy")} ${t("checkout.reference")}`}
											>
												<i
													className={copiedField === "reference" ? "ph ph-check" : "ph ph-copy"}
													aria-hidden
												/>
											</button>
										</div>
									</div>
									<div className="payment-reference-item">
										<span>{t("checkout.amount")}</span>
										<strong className="payment-reference-amount">
											{formatPrice(order.total, order.currency)}
										</strong>
									</div>
								</div>

								{error ? <p className="text-danger mt-3">{error}</p> : null}

								<button
									type="button"
									className="blue_btn round_btn btn-brand-dark w100 mt-4"
									onClick={handleSimulate}
									disabled={pending}
								>
									{pending ? t("checkout.simulating") : t("checkout.simulate")}
								</button>
							</div>
						) : null}

						{step === "success" && order ? (
							<div className="checkout-form checkout-success">
								<i className="ph ph-check-circle checkout-success-icon" aria-hidden />
								<h2>{t("checkout.successTitle")}</h2>
								<p>{t("checkout.successText")}</p>
								<Link href="/aluno/cursos" className="blue_btn round_btn btn-brand-dark">
									{t("checkout.goToMyCourses")}
								</Link>
							</div>
						) : null}
					</div>

					<div className="col-lg-5 col-12 wow fadeInUp">
						<div className="order-details">
							<div className="single-widget">
								<h2>{t("checkout.cartTotal")}</h2>
								<div className="content">
									<ul>
										<li>
											{cart.itemCount} {t("checkout.items")}
										</li>
										<li className="last checkout-total-row">
											{t("checkout.total")}
											<span>{totalLabel}</span>
										</li>
									</ul>
								</div>
							</div>

							{step === "summary" ? (
								<div className="single-widget get-button">
									<div className="content">
										<div className="button">
											{error ? <p className="text-danger">{error}</p> : null}
											<button
												type="button"
												className="blue_btn round_btn btn-brand-dark w100"
												onClick={handleProceed}
												disabled={pending || loading || cart.items.length === 0}
											>
												{pending ? t("checkout.processing") : t("checkout.proceed")}
											</button>
										</div>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

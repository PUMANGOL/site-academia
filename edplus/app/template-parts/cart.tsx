"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";
import { useCart } from "@/app/providers/cart-provider";
import { formatPrice, pickLocale } from "@/lib/i18n-content";

export default function ShoppingCart() {
	const { t, locale } = useI18n();
	const { cart, setQuantity, removeItem } = useCart();

	return (
		<div className="shopping-cart section-padding">
			<div className="container">
				<div className="row g-4">
					<div className="col-xl-8">
						{cart.items.length === 0 ? (
							<div className="cart-empty">
								<p>{t("cart.empty")}</p>
								<Link href="/courses" className="blue_btn round_btn">
									{t("cartPage.browseCourses")}
								</Link>
							</div>
						) : (
							<div className="cart-table">
								<div className="cart-table-head" aria-hidden="true">
									<span>{t("cartPage.products")}</span>
									<span>{t("cartPage.unitPrice")}</span>
									<span>{t("cartPage.quantity")}</span>
									<span>{t("cartPage.total")}</span>
									<span />
								</div>

								{cart.items.map((item) => {
									const title = pickLocale(item.title, locale);

									return (
										<article className="cart-table-row" key={item.id}>
											<div className="cart-product">
												<Link
													href={`/courses/${item.slug}`}
													className="cart-product-thumb"
												>
													<Image
														src={item.imageUrl}
														alt={title}
														fill
														sizes="112px"
													/>
												</Link>
												<Link
													href={`/courses/${item.slug}`}
													className="cart-product-title"
												>
													{title}
												</Link>
											</div>

											<div className="cart-meta">
												<div
													className="cart-cell cart-price"
													data-label={t("cartPage.unitPrice")}
												>
													{formatPrice(item.unitPrice, item.currency)}
												</div>

												<div
													className="cart-cell cart-qty"
													data-label={t("cartPage.quantity")}
												>
													<div className="qty-stepper">
														<button
															type="button"
															aria-label="-"
															onClick={() =>
																setQuantity(item.id, item.quantity - 1)
															}
														>
															-
														</button>
														<span>{item.quantity}</span>
														<button
															type="button"
															aria-label="+"
															onClick={() =>
																setQuantity(item.id, item.quantity + 1)
															}
														>
															+
														</button>
													</div>
												</div>

												<div
													className="cart-cell cart-line-total"
													data-label={t("cartPage.total")}
												>
													{formatPrice(item.lineTotal)}
												</div>
											</div>

											<button
												type="button"
												className="cart-remove"
												onClick={() => removeItem(item.id)}
												aria-label={t("miniCart.remove", { title })}
											>
												<i className="ti-trash"></i>
											</button>
										</article>
									);
								})}
							</div>
						)}
					</div>

					<div className="col-xl-4">
						<div className="cart-collaterals">
							<h2>{t("cartPage.cartTotals")}</h2>

							<div className="shop_table shop_table_responsive">
								<div className="cart-subtotal">
									<div className="title">{t("cart.subtotal")}</div>
									<div>
										<span className="woocommerce-Price-amount amount">
											<bdi>{formatPrice(cart.subtotal)}</bdi>
										</span>
									</div>
								</div>

								<div className="order-total">
									<div className="title">{t("cartPage.total")}</div>
									<div>
										<strong>
											<span className="woocommerce-Price-amount amount">
												<bdi>{formatPrice(cart.subtotal)}</bdi>
											</span>
										</strong>
									</div>
								</div>

								<div className="wc-proceed-to-checkout">
									<Link href="/checkout" className="blue_btn round_btn">
										{t("cartPage.proceed")}
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

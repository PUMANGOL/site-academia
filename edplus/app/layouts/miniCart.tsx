"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";
import { useCart } from "@/app/providers/cart-provider";
import { formatPrice, pickLocale } from "@/lib/i18n-content";

interface MiniCartProps {
	cartOpen: boolean;
	setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MiniCart({ cartOpen, setCartOpen }: MiniCartProps) {
	const { t, locale } = useI18n();
	const { cart, removeItem } = useCart();

	return (
		<div
			id="mini_cart"
			className={`min_cart_wrapper ${cartOpen ? "min_cart_active" : ""}`}
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					setCartOpen(false);
				}
			}}
		>
			<div className="cart_drawer">
				<div className="cart_top">
					<Link
						href="#"
						className="cart_close"
						onClick={(e) => {
							e.preventDefault();
							setCartOpen(false);
						}}
					>
						<i className="bx bx-x"></i>
					</Link>

					<h3 className="title">{t("miniCart.coursesList")}</h3>
					<span className="cart_number">{cart.itemCount}</span>
				</div>

				<div className="mini_cart_list">
					{cart.items.length === 0 ? (
						<p className="p-4">{t("cart.empty")}</p>
					) : (
						<ul>
							{cart.items.map((item) => (
								<li className="d-flex" key={item.id}>
									<div className="thumb_img_cartmini">
										<Link href="/courses" className="mc_img">
											<Image
												src={item.imageUrl}
												alt={pickLocale(item.title, locale)}
												width={80}
												height={80}
											/>
										</Link>
									</div>

									<div className="product-detail">
										<h3 className="product_name_mini">
											<Link href="/courses">
												{pickLocale(item.title, locale)}
											</Link>
										</h3>

										<div className="product_info">
											<div className="product_price">
												<span className="price_sale">
													<span className="quantity">
														{item.quantity} × {formatPrice(item.unitPrice, item.currency)}
													</span>
												</span>
											</div>
										</div>
									</div>

									<div className="produc_remove">
										<Link
											href="#"
											className="remove-product"
											aria-label={t("miniCart.remove", {
												title: pickLocale(item.title, locale),
											})}
											onClick={(event) => {
												event.preventDefault();
												removeItem(item.id);
											}}
										>
											<i className="bx bx-trash"></i>
										</Link>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="cart_drawer_btm">
					<div className="sub-total">
						<strong>{t("cart.subtotal")}:</strong>{" "}
						<span className="woocommerce-Price-amount amount">
							<bdi>{formatPrice(cart.subtotal)}</bdi>
						</span>
					</div>

					<div className="bottom_group">
						<Link href="/cart" className="button-viewcart">
							<span>{t("cart.viewCart")}</span>
						</Link>
						<Link href="/checkout" className="button-checkout">
							<span>{t("cart.checkout")}</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

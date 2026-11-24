"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWOW } from "@/app/hooks/useWOW";
import { useHeaderOffset, usePublicSite } from "@/app/hooks/useHeaderOffset";
import Link from "next/link";
import PopupSearch from "./popupSearch";
// import MiniCart from "./miniCart";
import Offcanvas from "./offCanvas";
import LanguageSwitcher from "@/app/i18n/LanguageSwitcher";
import ThemeSwitcher from "@/app/components/theme-switcher";
import SiteLogo from "@/app/components/site-logo";
import { useI18n } from "@/app/i18n/I18nProvider";
// import { useCart } from "@/app/providers/cart-provider";
// import UserMenu from "./user-menu";

export default function Header() {
	const [searchOpen, setSearchOpen] = useState(false);
	// const [cartOpen, setCartOpen] = useState(false);
	const [offcanvasOpen, setOffcanvasOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { t } = useI18n();
	// const { cart } = useCart();
	const pathname = usePathname();
	const overlay = pathname === "/";
	useWOW({ animateClass: "animated" });
	useHeaderOffset();
	usePublicSite(overlay);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 40);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<>
			<div className="ap-progress" aria-hidden="true" />
			<header
				id="navigation"
				className={`header_2${overlay ? " is-overlay" : ""}${scrolled ? " is-scrolled" : ""}`}
			>
				<div className="main-header">
					<div className="container">
						<div className="header-inner">
							<div className="site-logo">
								<Link href="/">
									<SiteLogo
										height={44}
										priority
										inverted={overlay && !scrolled}
									/>
								</Link>
							</div>

							<nav id="main-menu">
								<ul>
									<li className={pathname === "/" ? "is-current" : undefined}>
										<Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
											{t("nav.home")}
										</Link>
									</li>
									<li className={pathname === "/about" ? "is-current" : undefined}>
										<Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>
											{t("nav.about")}
										</Link>
									</li>
									<li className={pathname === "/catalogo" ? "is-current" : undefined}>
										<Link href="/catalogo" aria-current={pathname === "/catalogo" ? "page" : undefined}>
											{t("nav.courses")}
										</Link>
									</li>
									{/* <li className="menu-item-has-children">
										<a
											href="#"
											aria-haspopup="true"
											onClick={(e) => e.preventDefault()}
										>
											{t("nav.training")}
											<i className="ph ph-caret-down"></i>
										</a>
										<ul>
											<li>
												<Link href="/catalogo">{t("nav.courses")}</Link>
											</li>
											<li>
												<Link href="/calendario">{t("nav.calendar")}</Link>
											</li>
											<li>
												<Link href="/parceiros">{t("nav.forCompanies")}</Link>
											</li>
											<li>
												<Link href="/instructors">{t("nav.instructors")}</Link>
											</li>
										</ul>
									</li> */}
									<li>
										<Link href="/instructors">{t("nav.instructors")}</Link>
									</li>
									<li>
										<Link href="/noticias">{t("nav.news")}</Link>
									</li>
									<li>
										<Link href="/contact">{t("nav.contact")}</Link>
									</li>
								</ul>
							</nav>

							<div className="header_right">
								<div className="header-desktop-tools">
									<Link
										href="#"
										className="search_btn align-self-center"
										onClick={(e) => {
											e.preventDefault();
											setSearchOpen(true);
										}}
									>
										<i className="ph ph-magnifying-glass"></i>
									</Link>

									{/* <Link
										href="#"
										className="cart_btn mcart_icon align-self-center"
										onClick={(e) => {
											e.preventDefault();
											setCartOpen(true);
										}}
									>
										<i className="ph ph-shopping-cart"></i>
										<span>{cart.itemCount}</span>
									</Link> */}

									<ThemeSwitcher />

									<LanguageSwitcher />

									{/* <UserMenu /> */}
								</div>

								<Link href="/#contacto" className="header-cta d-none d-xl-inline-flex">
									{t("header.requestQuote")}
									<span>
										<i className="ph ph-arrow-right"></i>
									</span>
								</Link>

								<Link
									href="#"
									className="menu_btn sidebar__toggle align-self-center"
									aria-label="Menu"
									onClick={(e) => {
										e.preventDefault();
										setOffcanvasOpen(true);
									}}
								>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										aria-hidden="true"
									>
										<rect x="1.5" y="1.5" width="8.7" height="8.7" rx="1.3" />
										<rect x="13.75" y="1.5" width="8.7" height="8.7" rx="1.3" />
										<rect x="1.5" y="13.75" width="8.7" height="8.7" rx="1.3" />
										<circle cx="18.1" cy="18.1" r="4.35" />
									</svg>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* <MiniCart
				cartOpen={cartOpen}
				setCartOpen={setCartOpen}
			/> */}

			<PopupSearch
				searchOpen={searchOpen}
				setSearchOpen={setSearchOpen}
			/>

			<Offcanvas
				isOpen={offcanvasOpen}
				setIsOpen={setOffcanvasOpen}
				onOpenSearch={() => setSearchOpen(true)}
				// onOpenCart={() => setCartOpen(true)}
			/>
		</>
	);
}

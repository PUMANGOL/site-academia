"use client";

import { useWOW } from "@/app/hooks/useWOW";
import { useHeaderOffset, usePublicSite } from "@/app/hooks/useHeaderOffset";
import { useState } from "react";
import Link from "next/link";
import PopupSearch from "./popupSearch";
import Offcanvas from "./offCanvas";
import LanguageSwitcher from "@/app/i18n/LanguageSwitcher";
import ThemeSwitcher from "@/app/components/theme-switcher";
import SiteLogo from "@/app/components/site-logo";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Header() {
	const [searchOpen, setSearchOpen] = useState(false);
	const [offcanvasOpen, setOffcanvasOpen] = useState(false);
	const { t } = useI18n();
	useWOW({ animateClass: "animated" });
	useHeaderOffset();
	usePublicSite();
    return (
		<>
			<header id="navigation" className="header1">

				{/* Header Top */}
				<div className="header-top">
					<div className="container">
						<div className="row">

							<div className="col-lg-6 col-md-12 text-center htleft d-lg-flex align-self-center">

								<p className="align-self-center">
									<i className="fa-regular fa-user"></i>{" "}
									<Link href="/login">
										{t("header.registerLogin")}
									</Link>
								</p>

								<ul className="align-self-center text-center">
									<li><Link href="#"><i className="fa-brands fa-facebook-f"></i></Link></li>
									<li><Link href="#"><i className="fa-brands fa-x-twitter"></i></Link></li>
									<li><Link href="#"><i className="fa-brands fa-linkedin-in"></i></Link></li>
									<li><Link href="#"><i className="fa-brands fa-youtube"></i></Link></li>
								</ul>

							</div>

							<div className="col-lg-6 col-md-12 text-center htright d-lg-flex justify-content-end">

								<p className="align-self-center">
									<i className="fa-solid fa-headset"></i>
									<span> {t("header.callUs")}</span>{" "}
									<a href="tel:+99925476854">
										+99925476854
									</a>
								</p>

								<p className="align-self-center">
									<i className="fa-regular fa-envelope"></i>
									<span> {t("header.email")}</span>{" "}
									<a href="mailto:example@eduplus.com">
										example@eduplus.com
									</a>
								</p>
								<ThemeSwitcher />

								<LanguageSwitcher />

							</div>

						</div>
					</div>
				</div>

				{/* Main Header */}
				<div className="main-header">
					<div className="container">
						<div className="row">

							<div className="col-xl-3 col-md-3 col-5 align-self-center">

								<div className="header-left d-flex justify-content-start">

									<div className="site-logo">
										<Link href="/">
											<SiteLogo height={44} priority />
										</Link>
									</div>

								</div>

							</div>

							<div className="col-xl-9 col-md-9 col-7 align-self-center">

								<div className="header_right d-flex gap-4 justify-content-end">

								<nav id="main-menu">
										<ul>
											<li className="menu-item-has-children">
												<Link href="#">
													{t("nav.home")}
												</Link>

												<ul className="sub-menu">
													<li>
														<Link href="/">
															{t("nav.onlineCourses")}
														</Link>
													</li>
													<li>
														<Link href="/home-2">
															{t("nav.university")}
														</Link>
													</li>
													<li>
														<Link href="/home-3">
															{t("nav.distance")}
														</Link>
													</li>
													<li>
														<Link href="/home-4">
															{t("nav.onlineAcademy")}
														</Link>
													</li>
												</ul>
											</li>

											<li>
												<Link href="/about">
													{t("nav.about")}
												</Link>
											</li>

											<li className="menu-item-has-children">
												<Link href="/courses">
													{t("nav.courses")}
												</Link>

												<ul className="sub-menu">
													<li>
														<Link href="/courses">
															{t("nav.courseStyle")} 1
														</Link>
													</li>
													<li>
														<Link href="/courses2">
															{t("nav.courseStyle")} 2
														</Link>
													</li>
													<li>
														<Link href="/courses3">
															{t("nav.courseStyle")} 3
														</Link>
													</li>
													<li>
														<Link href="/courses4">
															{t("nav.courseStyle")} 4
														</Link>
													</li>
													<li>
														<Link href="/course-details">
															{t("nav.courseDetails")}
														</Link>
													</li>
												</ul>
											</li>

											<li className="menu-item-has-children">
												<Link href="#">
													{t("nav.pages")}
												</Link>

												<ul className="sub-menu">
													<li>
														<Link href="/about">
															{t("nav.about")}
														</Link>
													</li>
													<li>
														<Link href="/faq">
															{t("nav.faq")}
														</Link>
													</li>
													<li>
														<Link href="/instructors">
															{t("nav.instructors")}
														</Link>
													</li>
													<li>
														<Link href="/instructor-details">
															{t("nav.instructorDetails")}
														</Link>
													</li>
													<li>
														<Link href="/cart">
															{t("nav.cart")}
														</Link>
													</li>
													<li>
														<Link href="/checkout">
															{t("nav.checkout")}
														</Link>
													</li>
													<li>
														<Link href="/login">
															{t("nav.login")}
														</Link>
													</li>
													<li>
														<Link href="/register">
															{t("nav.register")}
														</Link>
													</li>
													<li>
														<Link href="/404">
															404
														</Link>
													</li>
												</ul>
											</li>

											<li>
												<Link href="/contact">
													{t("nav.contact")}
												</Link>
											</li>
										</ul>
									</nav>

									<button
										className="search_btn align-self-center"
										onClick={(e) => {
											e.preventDefault();
											setSearchOpen(true);
										}}
									>
										<i className="ph ph-magnifying-glass"></i>
									</button>

									<Link
										href="/apply"
										className="blue_btn align-self-center"
									>
										{t("header.enrollNow")}
									</Link>

									<button
										className="menu_btn sidebar__toggle align-self-center"
										type="button"
										aria-label="Menu"
										onClick={() => setOffcanvasOpen(true)}
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
									</button>

								</div>

							</div>

						</div>
					</div>
				</div>

			</header>

			<PopupSearch
				searchOpen={searchOpen}
				setSearchOpen={setSearchOpen}
			/>

			<Offcanvas
				isOpen={offcanvasOpen}
				setIsOpen={setOffcanvasOpen}
			/>

		</>
    );
}
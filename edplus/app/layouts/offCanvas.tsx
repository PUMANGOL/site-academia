"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";
import LanguageSwitcher from "@/app/i18n/LanguageSwitcher";
import ThemeSwitcher from "@/app/components/theme-switcher";
import SiteLogo from "@/app/components/site-logo";
// import { authClient } from "@/lib/auth-client";
// import { useCart } from "@/app/providers/cart-provider";

type OffcanvasProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onOpenSearch?: () => void;
  onOpenCart?: () => void;
};

export default function Offcanvas({
  isOpen,
  setIsOpen,
  onOpenSearch,
}: OffcanvasProps) {
    const { t } = useI18n();
    // const { data: session } = authClient.useSession();
    // const user = session?.user;
    // const { cart, refresh } = useCart();

    useEffect(() => {
        document.body.classList.toggle("offcanvas-open", isOpen);
        return () => document.body.classList.remove("offcanvas-open");
    }, [isOpen]);

    function closeMenu() {
        setIsOpen(false);
    }

    return (
        <>
            <div className="fix-area">
                <div
                    className={`offcanvas__info ${isOpen ? "info-open" : ""}`}
                >
                    <div className="offcanvas__wrapper">
                        <div className="offcanvas__content">
                            <div className="offcanvas__top d-flex justify-content-between align-items-center">
                                <div className="offcanvas__logo">
                                    <Link href="/" onClick={closeMenu}>
                                        <SiteLogo height={40} />
                                    </Link>
                                </div>

                                <div className="offcanvas__close">
                                    <button
                                        type="button"
                                        onClick={closeMenu}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="offcanvas-tools">
                                <button
                                    type="button"
                                    className="search_btn"
                                    aria-label={t("search.button")}
                                    onClick={() => {
                                        closeMenu();
                                        onOpenSearch?.();
                                    }}
                                >
                                    <i className="ph ph-magnifying-glass"></i>
                                </button>
                                {/* <button
                                    type="button"
                                    className="cart_btn mcart_icon"
                                    aria-label={t("nav.cart")}
                                    onClick={() => {
                                        closeMenu();
                                        onOpenCart?.();
                                    }}
                                >
                                    <i className="ph ph-shopping-cart"></i>
                                    <span>{cart.itemCount}</span>
                                </button> */}
                                <ThemeSwitcher />
                                <LanguageSwitcher />
                            </div>

                            {/* {user ? (
                                <div className="offcanvas-user">
                                    <div>
                                        <p>{user.name}</p>
                                        <small>{user.email}</small>
                                    </div>
                                    <button
                                        type="button"
                                        className="offcanvas-logout"
                                        onClick={async () => {
                                            await authClient.signOut();
                                            await refresh();
                                            closeMenu();
                                        }}
                                    >
                                        {t("auth.logout")}
                                    </button>
                                </div>
                            ) : (
                                <div className="offcanvas-auth-links">
                                    <Link href="/login" onClick={closeMenu}>
                                        {t("nav.login")}
                                    </Link>
                                    <Link href="/register" onClick={closeMenu}>
                                        {t("nav.register")}
                                    </Link>
                                </div>
                            )} */}

                            <div className="mobile-menu fix">
                                <ul className="mobile-menu-list">
                                    <li>
                                        <Link href="/" onClick={closeMenu}>{t("nav.home")}</Link>
                                    </li>
                                    <li>
                                        <Link href="/about" onClick={closeMenu}>{t("nav.about")}</Link>
                                    </li>
                                    <li>
                                        <Link href="/catalogo" onClick={closeMenu}>{t("nav.courses")}</Link>
                                    </li>
                                    {/* <li>
                                        <details>
                                            <summary>
                                                {t("nav.training")}
                                                <span className="dropdown-icon"></span>
                                            </summary>
                                            <ul className="submenu">
                                                <li>
                                                    <Link href="/catalogo" onClick={closeMenu}>{t("nav.courses")}</Link>
                                                </li>
                                                <li>
                                                    <Link href="/calendario" onClick={closeMenu}>{t("nav.calendar")}</Link>
                                                </li>
                                                <li>
                                                    <Link href="/parceiros" onClick={closeMenu}>{t("nav.forCompanies")}</Link>
                                                </li>
                                                <li>
                                                    <Link href="/instructors" onClick={closeMenu}>{t("nav.instructors")}</Link>
                                                </li>
                                            </ul>
                                        </details>
                                    </li> */}
                                    <li>
                                        <Link href="/instructors" onClick={closeMenu}>{t("nav.instructors")}</Link>
                                    </li>
                                    <li>
                                        <Link href="/noticias" onClick={closeMenu}>{t("nav.news")}</Link>
                                    </li>
                                    <li>
                                        <Link href="/aluno" onClick={closeMenu}>{t("nav.studentArea")}</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" onClick={closeMenu}>{t("nav.contact")}</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`offcanvas__overlay ${isOpen ? "overlay-open" : ""}`}
                onClick={closeMenu}
            ></div>
        </>
    );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Footer() {
    const { t } = useI18n();
    return (
         <>  
        <section className="container">
            <div
                className="contact_info"
                style={{
                    backgroundImage: "url(/assets/img/bg/contact-info.svg)",
                }}
            >
                <div className="row gy-5">
                    <div className="col-xl-4 col-md-6 col-12 wow fadeInUp">
                        <div className="contact_item">
                            <div className="cont_icon">
                                <i className="ph ph-map-pin"></i>
                            </div>

                            <div className="con_content">
                                <span>{t("contact.address")}</span>
                                <h4>{t("sidebar.address")}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-md-6 col-12 wow fadeInUp">
                        <div className="contact_item">
                            <div className="cont_icon">
                                <i className="ph ph-envelope-simple"></i>
                            </div>

                            <div className="con_content">
                                <span>{t("contact.email")}</span>
                                <h4>
                                    <a href="mailto:support@example.com">
                                        support@example.com
                                    </a>
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-md-6 col-12 wow fadeInUp">
                        <div className="contact_item">
                            <div className="cont_icon">
                                <i className="ph ph-headset"></i>
                            </div>

                            <div className="con_content">
                                <span>{t("contact.phone")}</span>
                                <h4>
                                    <a href="tel:+9801736895478">
                                        +9801736895478
                                    </a>
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer
            className="footer-area"
            style={{ backgroundImage: "url('/assets/img/bg/footer2.jpg')" }}
        >
            <div className="container">
                <div className="row">

                    {/* About */}
                    <div className="col-lg-3 col-md-6 col-12 footer-logo align-self-center">
                        <div className="footer-widget about-widget">
                            <h4 className="ftitle">{t("footer.about")}</h4>

                            <p>
                                {t("footer.aboutText")}
                            </p>

                            <ul className="fsocial-option">
                                <li><Link href="#"><i className="fa-brands fa-facebook-f"></i></Link></li>
                                <li><Link href="#"><i className="fa-brands fa-x-twitter"></i></Link></li>
                                <li><Link href="#"><i className="fa-brands fa-linkedin-in"></i></Link></li>
                                <li><Link href="#"><i className="fa-brands fa-youtube"></i></Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Company */}
                    <div className="col-lg-2 col-md-6 col-12">
                        <div className="footer-widget">
                            <h4 className="ftitle">{t("footer.company")}</h4>

                            <ul>
                                <li><Link href="/about">{t("footer.links.about")}</Link></li>
                                <li><Link href="/courses">{t("footer.links.course")}</Link></li>
                                <li><Link href="/instructors">{t("footer.links.instructor")}</Link></li>
                                <li><Link href="/events">{t("footer.links.events")}</Link></li>
                                <li><Link href="/instructor-details">{t("footer.links.instructorDetails")}</Link></li>
                                <li><Link href="/faq">{t("footer.links.guide")}</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Useful Links */}
                    <div className="col-lg-2 col-md-6 col-12">
                        <div className="footer-widget">
                            <h4 className="ftitle">{t("footer.useful")}</h4>

                            <ul>
                                <li><Link href="/contact">{t("footer.links.contact")}</Link></li>
                                <li><Link href="/courses">{t("footer.links.technology")}</Link></li>
                                <li><Link href="/instructors">{t("nav.instructors")}</Link></li>
                                <li><Link href="/faq">{t("footer.links.pricing")}</Link></li>
                                <li><Link href="/about">{t("footer.links.service")}</Link></li>
                                <li><Link href="/faq">{t("footer.links.privacy")}</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Explore */}
                    <div className="col-lg-2 col-md-6 col-12">
                        <div className="footer-widget">
                            <h4 className="ftitle">{t("footer.explore")}</h4>

                            <ul>
                                <li><Link href="/contact">{t("footer.links.contact")}</Link></li>
                                <li><Link href="/courses">{t("footer.links.technology")}</Link></li>
                                <li><Link href="/instructors">{t("nav.instructors")}</Link></li>
                                <li><Link href="/faq">{t("footer.links.pricing")}</Link></li>
                                <li><Link href="/about">{t("footer.links.service")}</Link></li>
                                <li><Link href="/faq">{t("footer.links.privacy")}</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className="footer-widget newsletter-widget">
                            <h4 className="ftitle">{t("footer.newsletter")}</h4>

                            <p>
                                {t("footer.newsletterText")}
                            </p>

                            <div className="news_form">
                                <form>
                                    <input
                                        type="email"
                                        placeholder={t("contact.emailPlaceholder")}
                                    />

                                    <button type="submit">
                                        <i className="ph ph-paper-plane-right"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Copyright */}
            <div className="copyright">
                <div className="container">
                    <div className="row">

                        <div className="col-md-6 col-12 text-md-start text-center">
                            <Link href="/">
                                <Image
                                    src="/assets/img/logo2.png"
                                    alt="Academia Pumangol"
                                    width={200}
                                    height={59}
                                />
                            </Link>
                        </div>

                        <div className="col-md-6 col-12 text-md-end text-center">
                            <p>
                                {t("footer.copyright")}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

        </footer>

        </> 
    );
}
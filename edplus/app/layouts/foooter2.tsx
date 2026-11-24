"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteLogo from "@/app/components/site-logo";
import FooterArches from "@/app/components/footer-arches";
import LeadContact from "@/app/components/lead-contact";
import { useI18n } from "@/app/i18n/I18nProvider";

const footerData = {
	about: {
		email: "academia@pumangol.co.ao",
		phone: "",
		location: "Talatona, Luanda",
	},

	company: [
		{ titleKey: "footer.links.about", url: "/about" },
		{ titleKey: "nav.courses", url: "/catalogo" },
		{ titleKey: "nav.instructors", url: "/instructors" },
		{ titleKey: "nav.partners", url: "/parceiros" },
		{ titleKey: "nav.news", url: "/noticias" },
	],

	usefulLinks: [
		{ titleKey: "nav.forCompanies", url: "/parceiros" },
		// { titleKey: "nav.courses", url: "/catalogo" },
		// { titleKey: "nav.calendar", url: "/calendario" },
		{ titleKey: "footer.links.contact", url: "/contact" },
	],

	explore: [
		{ titleKey: "footer.links.privacy", url: "/privacidade" },
		{ titleKey: "footer.links.terms", url: "/termos" },
		{ titleKey: "nav.faq", url: "/faq" },
	],

	socials: [
		{ icon: "fa-brands fa-facebook-f", url: "#" },
		{ icon: "fa-brands fa-x-twitter", url: "#" },
		{ icon: "fa-brands fa-linkedin-in", url: "#" },
		{ icon: "fa-brands fa-youtube", url: "#" },
	],
};

export default function FooterTwo() {
	const { t } = useI18n();
	const pathname = usePathname();
	return (
		<>
			{pathname === "/" ? <LeadContact /> : null}
		<footer className="footer-area fstyle-two">
			<div className="container">
				<div className="row gy-5">
					<div className="col-lg-4 col-md-6 footer-logo wow fadeIn">
						<div className="footer-widget about-widget">
							<Link href="/">
								<SiteLogo height={80} signature inverted />
							</Link>

							<p className="mt-4">{t("footer.aboutText")}</p>

							<label className="d-block text-white fw-bold mt-4 mb-2" htmlFor="footer-newsletter">
								{t("footer.newsletter")}
							</label>
							<div className="news_form">
								<form action="#" method="get">
									<input
										id="footer-newsletter"
										type="email"
										name="EMAIL"
										placeholder="nome@empresa.ao"
									/>
									<button type="submit" aria-label={t("footer.newsletter")}>
										<i className="ph ph-paper-plane-right"></i>
									</button>
								</form>
							</div>
						</div>
					</div>

					<div className="col-lg-2 col-md-6 wow fadeIn">
						<div className="footer-widget">
							<h4 className="ftitle">{t("footer.company")}</h4>
							<ul>
								{footerData.company.map((item, index) => (
									<li key={index}>
										<Link href={item.url}>{t(item.titleKey)}</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="col-lg-3 col-md-6 wow fadeIn">
						<div className="footer-widget">
							<h4 className="ftitle">{t("nav.training")}</h4>
							<ul>
								{footerData.usefulLinks.map((item, index) => (
									<li key={index}>
										<Link href={item.url}>{t(item.titleKey)}</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="col-lg-3 col-md-6 wow fadeIn">
						<div className="footer-widget">
							<h4 className="ftitle">{t("footer.links.contact")}</h4>
							<ul>
								<li>{footerData.about.location}</li>
								<li>
									<Link href={`mailto:${footerData.about.email}`}>
										{footerData.about.email}
									</Link>
								</li>
							</ul>
							<ul className="fsocial-option2 mt-3">
								{footerData.socials.map((item, index) => (
									<li key={index}>
										<Link href={item.url}>
											<i className={item.icon}></i>
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>

			<FooterArches />

			<div className="copyright">
				<div className="container">
					<div className="row">
						<div className="col-md-6 col-12 text-md-start text-center">
							<p>{t("footer.copyright")}</p>
						</div>
						<div className="col-md-6 col-12 text-md-end text-center">
							<p>
								<Link href="/privacidade">{t("footer.links.privacy")}</Link>
								{" · "}
								<Link href="/termos">{t("footer.links.terms")}</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
		</>
	);
}

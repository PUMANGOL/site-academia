"use client";

import Image from "next/image";
import { useI18n } from "@/app/i18n/I18nProvider";

// Pesquisa usada no mapa (Google Maps, sem chave de API).
const MAP_QUERY = "Academia Pumangol, Talatona, Luanda, Angola";
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=16&output=embed`;

export default function ContactSection() {
	const { t } = useI18n();

	return (
		<section className="contact-us section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-6 wow fadeInUp">
						<div className="section-title text-start">
							<h2>
								{t("contact.title")} <br />
								{t("contact.title2")}
							</h2>

							<Image
								src="/assets/img/shapes/title.svg"
								alt=""
								width={120}
								height={20}
							/>
						</div>

						<div className="contact-info">
							<div className="contact-item">
								<div className="cont_icon">
									<i className="ph ph-map-pin"></i>
								</div>
								<div className="cont_content">
									<h4>{t("contact.address")}</h4>
									<p>{t("contact.addressValue")}</p>
								</div>
							</div>

							<div className="contact-item">
								<div className="cont_icon">
									<i className="ph ph-envelope-simple"></i>
								</div>
								<div className="cont_content">
									<h4>{t("contact.email")}</h4>
									<p>
										<a href="mailto:academia@pumangol.co.ao">
											academia@pumangol.co.ao
										</a>
									</p>
								</div>
							</div>

							<div className="contact-item">
								<div className="cont_icon">
									<i className="ph ph-clock"></i>
								</div>
								<div className="cont_content">
									<h4>{t("contact.hours")}</h4>
									<p>{t("contact.hoursValue")}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="col-xl-6">
						<div className="contact-form">
							<div className="cf_title wow fadeInUp">
								<h4>{t("contact.formTitle")}</h4>
								<p>{t("contact.formText")}</p>
							</div>

							<form id="contact-form" action="contact.php" className="wow fadeInUp">
								<input type="text" placeholder={t("contact.fullName")} />
								<input type="email" placeholder={t("contact.emailPlaceholder")} />
								<input type="text" placeholder={t("contact.subject")} />
								<textarea placeholder={t("contact.message")}></textarea>
								<button type="submit" className="fbtn">
									{t("contact.send")} <i className="ph ph-arrow-right"></i>
								</button>
								<p className="form-message"></p>
							</form>
						</div>
					</div>
				</div>

				<div className="contact-map wow fadeInUp">
					<iframe
						src={MAP_EMBED_URL}
						title={t("contact.mapTitle")}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						allowFullScreen
					/>
				</div>
			</div>
		</section>
	);
}

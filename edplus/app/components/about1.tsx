"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function AboutUs() {
	const { t } = useI18n();
	const aboutItems = [
		{
			id: 1,
			icon: "/assets/img/icons/about/1.svg",
			title: t("aboutPage.mission"),
			description: t("aboutPage.itemText"),
		},
		{
			id: 2,
			icon: "/assets/img/icons/about/2.svg",
			title: t("aboutPage.vision"),
			description: t("aboutPage.itemText"),
		},
	];

	return (
		<section className="about-us section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-6 col-12 align-self-center wow fadeInUp">
						<div className="about-img position-relative">
							<div className="about_badge">
								<Image
									src="/assets/img/icons/graduate.svg"
									alt="Graduate"
									width={60}
									height={60}
                                    className="d-inline-block"
								/>
								<h4>{t("aboutPage.badge")}</h4>
							</div>

							<Image
								src="/assets/img/about/edificio.jpg"
								className="about_img_1"
								alt="Academia Pumangol, Talatona"
								width={450}
								height={550}
							/>

							<Image
								src="/assets/img/about/4.jpg"
								className="about_img_2"
								alt="Recepção da Academia Pumangol"
								width={320}
								height={420}
							/>

							<Image
								src="/assets/img/about/5.jpg"
								className="about_img_3"
								alt="Sala de formação da Academia Pumangol"
								width={220}
								height={160}
							/>

							<h2 className="ab_wmark">{t("aboutPage.est")}</h2>

							<Image
								src="/assets/img/shapes/ab_wave.svg"
								className="ab_top_shape aniupDown position-absolute"
								alt="Wave Shape"
								width={120}
								height={120}
							/>

							<Image
								src="/assets/img/shapes/ab_dots.svg"
								className="ab_btm_shape position-absolute"
								alt="Dots Shape"
								width={120}
								height={120}
							/>
						</div>
					</div>

					<div className="col-xl-6 col-12 align-self-center wow fadeInUp">
						<div className="about-content position-relative">
							<div className="section-title mb30">
								<span>
									<span className="ticon">
										<Image
											src="/assets/img/icons/title-icon.svg"
											alt="Title Icon"
											width={24}
											height={24}
										/>
									</span>{" "}
									{t("aboutPage.eyebrow")}
								</span>

								<h2>{t("aboutPage.title")}</h2>

								<Image
									src="/assets/img/shapes/title.svg"
									alt="Title Shape"
									width={216}
									height={19}
								/>
							</div>

							<p>
								{t("aboutPage.text")}
							</p>

							<div className="d-flex gap-4 aitem_wrap mb-4">
								{aboutItems.map((item) => (
									<div className="about_item" key={item.id}>
										<Image
											src={item.icon}
											alt={item.title}
											width={60}
											height={60}
										/>

										<h4>{item.title}</h4>

										<p>{item.description}</p>
									</div>
								))}
							</div>
							
							<Image
								src="/assets/img/icons/about/ed_cap.svg"
								className="ab_book_shape aniupDown position-absolute"
								alt="Cap"
								width={100}
								height={100}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
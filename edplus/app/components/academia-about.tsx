"use client";

import Image from "next/image";
import BrandMark from "@/app/components/brand-mark";
import AboutTwo from "@/app/components/about2";
import Video from "@/app/components/video";
import { brandImages } from "@/app/data/brand-images";
import { useI18n } from "@/app/i18n/I18nProvider";

const timeline = [
	{ year: "t1Year", title: "t1Title", text: "t1Text" },
	{ year: "t2Year", title: "t2Title", text: "t2Text" },
	{ year: "t3Year", title: "t3Title", text: "t3Text" },
	{ year: "t4Year", title: "t4Title", text: "t4Text" },
] as const;

const venues = [
	{ src: brandImages.eventPodium, key: "venue1", className: "is-wide", pos: "center 25%" },
	{ src: brandImages.eventAudience, key: "venue2", className: "", pos: "center 40%" },
	{ src: brandImages.eventMic, key: "venue3", className: "", pos: "center 20%" },
	{ src: brandImages.eventTalk, key: "venue4", className: "is-wide", pos: "center 30%" },
] as const;

export default function AcademiaAbout() {
	const { t } = useI18n();

	return (
		<>
			<Video flush />

			<AboutTwo
				showCta={false}
				data={{
					eyebrow: t("academia.facilityEyebrow"),
					title: t("academia.facilityTitle"),
					text: t("academia.facilityText"),
					image1: "/assets/img/about/edificio-talatona.jpg",
					image2: "/assets/img/about/sala-formacao.jpg",
					image3: "/assets/img/about/recepcao.jpg",
					imagePosition: "left",
					showButton: false,
					items: [
						{
							icon: "/assets/img/icons/about/2.svg",
							title: t("academia.mission"),
							text: t("academia.missionText"),
						},
						{
							icon: "/assets/img/icons/about/2.svg",
							title: t("academia.vision"),
							text: t("academia.visionText"),
						},
						{
							icon: "/assets/img/icons/about/2.svg",
							title: t("academia.values"),
							text: t("academia.valuesText"),
						},
					],
				}}
			/>

			<section className="ap-story ap-stack">
				<div className="container">
					<div className="ap-story-grid">
						<div>
							<div className="section-title mb-0">
								<span>
									<BrandMark />
									{t("academia.storyEyebrow")}
								</span>
								<h2>{t("academia.storyTitle")}</h2>
							</div>
							<p>{t("academia.storyP1")}</p>
							<p>{t("academia.storyP2")}</p>
						</div>
						<ol className="ap-tl">
							{timeline.map((item) => (
								<li key={item.year}>
									<span className="disp">{t(`academia.${item.year}`)}</span>
									<strong className="disp">{t(`academia.${item.title}`)}</strong>
									<p>{t(`academia.${item.text}`)}</p>
								</li>
							))}
						</ol>
					</div>
				</div>
			</section>

			<section id="parcerias" className="ap-partners-sec">
				<div className="container">
					<div className="section-title mb-0">
						<span>
							<BrandMark />
							{t("academia.partnersEyebrow")}
						</span>
						<h2>{t("academia.partnersTitle")}</h2>
					</div>
					<div className="ap-partners-grid">
						<article className="ap-partner-card lift">
							<Image
								src="/assets/img/about/nova-logo-exec-education.png"
								alt={t("academia.nova")}
								width={625}
								height={110}
								className="ap-partner-logo"
							/>
							<p>{t("academia.novaText")}</p>
						</article>
					</div>
				</div>
			</section>

			<section className="ap-venue ap-stack">
				<div className="container">
					<div className="section-title mb-0">
						<span>
							<BrandMark />
							{t("academia.venueEyebrow")}
						</span>
						<h2>{t("academia.venueTitle")}</h2>
					</div>
					<div className="ap-venue-grid">
						{venues.map((item) => (
							<figure key={item.key} className={`ap-venue-item zoom ${item.className}`.trim()}>
								<Image
									src={item.src}
									alt={t(`academia.${item.key}`)}
									fill
									sizes={item.className ? "(max-width: 900px) 100vw, 50vw" : "(max-width: 900px) 50vw, 25vw"}
									style={{ objectFit: "cover", objectPosition: item.pos }}
								/>
								<figcaption>{t(`academia.${item.key}`)}</figcaption>
							</figure>
						))}
					</div>
				</div>
			</section>

			<section className="ap-join">
				<Image
					src={brandImages.eventWomen}
					alt=""
					fill
					sizes="100vw"
					className="ap-join-bg"
					style={{ objectFit: "cover", objectPosition: "center 30%" }}
				/>
				<div className="container">
					<h2>{t("academia.joinTitle")}</h2>
					<p>{t("academia.joinText")}</p>
					{/* <Link href="/courses" className="blue_btn round_btn">
						{t("academia.joinCta")}
						<i className="ph ph-arrow-right" aria-hidden />
					</Link> */}
				</div>
			</section>
		</>
	);
}

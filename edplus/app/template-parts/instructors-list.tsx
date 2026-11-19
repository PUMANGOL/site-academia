"use client";

import Image from "next/image";
import BrandMark from "@/app/components/brand-mark";
import { useI18n } from "@/app/i18n/I18nProvider";

const trainers = [
	{
		name: "Andreas Galsterer",
		role: "t1Role",
		teaches: "t1Teaches",
		photo: "/assets/img/academia/formador-andreas.jpg",
	},
	{
		name: "Katy Martilíano",
		role: "t2Role",
		teaches: "t2Teaches",
		photo: "/assets/img/academia/formador-katy.jpg",
	},
	{
		name: "Fernando Fallé",
		role: "t3Role",
		teaches: "t3Teaches",
		photo: "/assets/img/academia/formador-fernando.jpg",
	},
	{
		name: "Miguel Soares",
		role: "t4Role",
		teaches: "t4Teaches",
		photo: "/assets/img/academia/formador-miguel.jpg",
	},
] as const;

export default function InstructorsList() {
	const { t } = useI18n();

	return (
		<section className="ap-trainers ap-stack">
			<div className="container">
				<div className="section-title mb-0">
					<span>
						<BrandMark />
						{t("trainersHome.eyebrow")}
					</span>
					<h2>{t("trainersHome.title")}</h2>
				</div>
				<p className="ap-trainers-lead">{t("trainersHome.lead")}</p>
				<div className="ap-trainer-grid">
					{trainers.map((item) => (
						<article className="ap-tr" key={item.name}>
							<div className="ap-tr-photo zoom">
								<Image
									src={item.photo}
									alt={item.name}
									fill
									sizes="(max-width: 767px) 100vw, 25vw"
								/>
								<span className="bio">
									<span>{t("trainersHome.teaches")}</span>
									<span>{t(`trainersHome.${item.teaches}`)}</span>
								</span>
							</div>
							<div>
								<div className="disp">{item.name}</div>
								<div className="ap-tr-role">{t(`trainersHome.${item.role}`)}</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

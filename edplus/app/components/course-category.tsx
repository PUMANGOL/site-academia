"use client";

import Image from "next/image";
// import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import { brandImages } from "@/app/data/brand-images";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";

const categories = [
	{
		id: 1,
		key: "hsse",
		image: brandImages.formacaoInst,
		pos: "center top",
		programs: "10 formações",
	},
	{
		id: 2,
		key: "leadership",
		image: brandImages.formadorNadim,
		pos: "center 15%",
		programs: "11 formações",
	},
	{
		id: 3,
		key: "experience",
		image: brandImages.formacaoTablet,
		pos: "center 30%",
		programs: "4 formações",
	},
	{
		id: 4,
		key: "business",
		image: brandImages.formacaoLaptop,
		pos: "center",
		programs: "4 formações",
	},
	{
		id: 5,
		key: "technology",
		image: brandImages.eventPodium,
		pos: "center 20%",
		programs: "8 formações",
	},
];

export default function CourseCategory({ data }: { data?: BlockData }) {
	const { t, text } = useBlockContent("categories", data);

	return (
		<section id="areas" className="course-category section-padding">
			<div className="container">
				<div className="row align-items-end gy-4 mb-5">
					<div className="col-lg-7 wow fadeInUp">
						<div className="section-title mb-0">
							<span>
								<BrandMark />
								{text("eyebrow")}
							</span>
							<h2>
								{text("title1")} {text("title2")}
							</h2>
						</div>
					</div>
					<div className="col-lg-5 wow fadeInUp ap-areas-cta">
						<p className="mb-0">{t("category.lead")}</p>
						{/* <Link href="/courses" className="blue_btn round_btn btn-brand-dark">
							{t("category.viewAll")}
							<i className="ph ph-arrow-right" />
						</Link> */}
					</div>
				</div>

				<div className="ap-acc">
					{categories.map((category) => {
						const title = t(`category.items.${category.key}`);
						const desc = t(`category.desc.${category.key}`);
						return (
							// <Link href="/courses" key={category.id} className="wow fadeInUp">
							<div key={category.id} className="wow fadeInUp">
								<Image
									src={category.image}
									alt={title}
									fill
									sizes="(max-width: 900px) 100vw, 20vw"
									style={{ objectFit: "cover", objectPosition: category.pos }}
								/>
								<span className="ap-acc-veil" />
								<span className="ap-acc-n">0{category.id}</span>
								<span className="ap-acc-vt">{title}</span>
								<span className="ap-acc-more">
									<span className="disp">{title}</span>
									<span className="d-block mt-2" style={{ fontSize: 15, color: "#FFFFFF", lineHeight: 1.55 }}>
										{desc}
									</span>
									<span className="ap-acc-pill">{category.programs}</span>
								</span>
							</div>
							// </Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}

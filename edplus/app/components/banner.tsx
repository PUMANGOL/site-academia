"use client";

import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";

export default function MainBanner({
	page = "contact",
	bgImage = "/assets/img/academia/hero-stage.jpg",
	data,
}: {
	page?: string;
	title?: string;
	breadcrumb?: string;
	bgImage?: string;
	// Conteúdo do bloco "Banner de página" do backoffice.
	data?: BlockData;
}) {
	const { t, text } = useBlockContent("pageBanner", data);
	const label = (data && text("title")) || t(`pages.${page}`);
	const background =
		page === "news" || page === "instructors" || page === "terms" || page === "privacy" || page === "courses"
			? "/assets/img/academia/hero-braids.jpg"
			: data
				? text("backgroundImage")
				: bgImage;

	const isLightBanner =
		background.includes(".svg") || background.includes("home-banner.png");
	const isCatalog = page === "courses";

	return (
		<section
			className={`main-banner${isLightBanner ? " banner-light" : ""}${isCatalog ? " ap-catalog-banner" : ""}`}
			style={{
				backgroundImage: `url('${background}')`,
			}}
		>
			<div className={`container${isCatalog ? "" : " text-center"}`}>
				<div className="mbanner_content">
					{isCatalog ? (
						<span className="ap-catalog-kicker">
							<BrandMark variant="dark" />
							{t("courses.eyebrow")}
						</span>
					) : null}
					<h2>{label}</h2>

					<p className={isCatalog ? "ap-crumb" : undefined}>
						<Link href="/">{t("pages.home")}</Link>{" "}
						<i className="ph ph-caret-right"></i>{" "}
						{label}
					</p>
				</div>
			</div>
		</section>
	);
}

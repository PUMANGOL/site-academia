"use client";

import Image from "next/image";
// import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function FeaturedPrograms({ data }: { data?: BlockData }) {
	const { text, list, itemText } = useBlockContent("featuredPrograms", data);
	const programs = list("items");

	return (
		<section id="destaque" className="ap-featured">
			<div className="container">
				<div className="ap-sec-split sec-in">
					<div>
						<div className="section-title mb-0">
							<span className="ap-on-dark">
								<BrandMark variant="dark" />
								{text("eyebrow")}
							</span>
							<h2>{text("title")}</h2>
						</div>
					</div>
					<p>{text("lead")}</p>
				</div>

				<div className="ap-stackcards">
					{programs.map((item, index) => {
						const dark = index % 2 === 1;
						const image = itemText(item, "image");
						return (
							<article
								key={index}
								className={`ap-stackcard${dark ? " is-dark" : ""}`}
								style={{ top: `${110 + index * 26}px`, zIndex: index + 1 }}
							>
								<div className="ap-stackcard-body">
									<div className="ap-stackcard-meta">
										<span className="disp">{String(index + 1).padStart(2, "0")}</span>
										<span className="ap-tag">{itemText(item, "tag")}</span>
									</div>
									<h3>{itemText(item, "title")}</h3>
									<p>{itemText(item, "text")}</p>
									<div className="ap-pills">
										<span>{itemText(item, "date")}</span>
										<span>{itemText(item, "hours")}</span>
										<span>{itemText(item, "place")}</span>
									</div>
									<div className="ap-stackcard-cta">
										{/* <Link
											href={itemText(item, "href") || "/courses"}
											className={`blue_btn round_btn${dark ? "" : " btn-brand-dark"}`}
										>
											{text("enroll")}
											<i className="ph ph-arrow-right" aria-hidden />
										</Link> */}
										<span>{itemText(item, "who")}</span>
									</div>
								</div>
								{image ? (
									<div className="ap-stackcard-media">
										<Image
											src={image}
											alt={itemText(item, "title")}
											fill
											sizes="(max-width: 991px) 100vw, 46vw"
											unoptimized={isExternal(image)}
										/>
									</div>
								) : null}
							</article>
						);
					})}
				</div>

				<div className="ap-featured-foot">
					{/* <Link href={text("buttonHref") || "/calendario"} className="blue_btn round_btn">
						{text("buttonLabel")}
						<i className="ph ph-arrow-right" aria-hidden />
					</Link> */}
					<span>{text("note")}</span>
				</div>
			</div>
		</section>
	);
}

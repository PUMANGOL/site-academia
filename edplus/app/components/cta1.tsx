"use client";

import Image from "next/image";
import Link from "next/link";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function CTA({ data }: { data?: BlockData }) {
	const { list, itemText } = useBlockContent("cta", data);
	const cards = list("cards");

	return (
		<section className="container section-padding">
			<div className="row g-4">
				{cards.map((card, index) => {
					const highlight = itemText(card, "highlight");
					const image = itemText(card, "image");
					const buttonLabel = itemText(card, "buttonLabel");
					return (
						<div
							key={index}
							className={`${cards.length === 1 ? "col-12" : "col-lg-6 col-12"} d-flex`}
						>
							<div className={`cta2 ${itemText(card, "color") === "green" ? "color_green" : ""}`}>
								<div className="cta-content wow fadeInUp">
									<h2>
										{itemText(card, "title")} <span>{highlight}</span>
									</h2>

									<p>{itemText(card, "text")}</p>

									{buttonLabel ? (
										<Link
											href={itemText(card, "buttonHref") || "/courses"}
											className="white_btn round_btn"
										>
											{buttonLabel}
										</Link>
									) : null}
								</div>

								{image ? (
									<Image
										src={image}
										alt={highlight}
										width={190}
										height={280}
										className="cta_img"
										unoptimized={isExternal(image)}
									/>
								) : null}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

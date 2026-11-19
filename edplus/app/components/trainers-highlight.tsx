"use client";

import Image from "next/image";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function TrainersHighlight({ data }: { data?: BlockData }) {
	const { text, list, itemText } = useBlockContent("trainersHighlight", data);
	const trainers = list("items");

	return (
		<section id="formadores" className="ap-trainers ap-stack">
			<div className="container">
				<div className="ap-sec-split sec-in">
					<div>
						<div className="section-title mb-0">
							<span>
								<BrandMark />
								{text("eyebrow")}
							</span>
							<h2>{text("title")}</h2>
						</div>
					</div>
					<div>
						<p>{text("lead")}</p>
						<Link href={text("buttonHref") || "/instructors"} className="blue_btn round_btn btn-brand-dark mt-3">
							{text("buttonLabel")}
							<i className="ph ph-arrow-right" aria-hidden />
						</Link>
					</div>
				</div>
				<div className="ap-trainer-grid">
					{trainers.map((item, index) => {
						const photo = itemText(item, "photo");
						const href = itemText(item, "href") || "/instructors";
						return (
							<Link href={href} className="ap-tr lift" key={index}>
								<div className="ap-tr-photo zoom">
									{photo ? (
										<Image
											src={photo}
											alt={itemText(item, "name")}
											fill
											sizes="(max-width: 767px) 100vw, 25vw"
											unoptimized={isExternal(photo)}
										/>
									) : null}
									<span className="bio">
										<span>{text("teaches")}</span>
										<span>{itemText(item, "teaches")}</span>
									</span>
								</div>
								<div>
									<div className="disp">{itemText(item, "name")}</div>
									<div className="ap-tr-role">{itemText(item, "role")}</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}

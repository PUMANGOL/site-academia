"use client";

import Image from "next/image";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function ForCompanies({ data }: { data?: BlockData }) {
	const { text, list, itemText } = useBlockContent("forCompanies", data);
	const steps = list("steps");
	const image = text("image");

	return (
		<section id="empresas" className="ap-empresas ap-stack">
			<div className="container">
				<div className="ap-empresas-grid">
					<div className="ap-empresas-media">
						<div className="ap-irv">
							<Image
								src={image}
								alt={text("title")}
								fill
								sizes="(max-width: 991px) 100vw, 50vw"
								unoptimized={isExternal(image)}
							/>
						</div>
						<div className="ap-float-stat">
							<div className="disp">{text("percent")}</div>
							<div>{text("percentLabel")}</div>
						</div>
					</div>
					<div className="ap-empresas-copy sec-in">
						<div className="section-title mb-0">
							<span>
								<BrandMark />
								{text("eyebrow")}
							</span>
							<h2>{text("title")}</h2>
						</div>
						<p>{text("text")}</p>
						<div className="ap-steps">
							{steps.map((step, index) => (
								<div key={index} className="ap-step">
									<div className="disp">{itemText(step, "n") || String(index + 1).padStart(2, "0")}</div>
									<div className="fw-bold">{itemText(step, "title")}</div>
									<div>{itemText(step, "text")}</div>
								</div>
							))}
						</div>
						<div className="ap-empresas-cta">
							<Link href={text("buttonHref") || "/#contacto"} className="blue_btn round_btn btn-brand-dark">
								{text("buttonLabel")}
								<i className="ph ph-arrow-right" aria-hidden />
							</Link>
							{/* <Link href={text("linkHref") || "/courses"} className="ap-text-link">
								{text("linkLabel")}
							</Link> */}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

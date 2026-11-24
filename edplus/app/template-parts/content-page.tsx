"use client";

import Link from "next/link";

export default function ContentPage({
	eyebrow,
	title,
	lead,
	paragraphs,
	ctaHref,
	ctaLabel,
}: {
	eyebrow?: string;
	title: string;
	lead?: string;
	paragraphs: string[];
	ctaHref?: string;
	ctaLabel?: string;
}) {
	return (
		<section className="site-content section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-8 col-lg-10 mx-auto">
						{eyebrow ? <span className="site-content-eyebrow">{eyebrow}</span> : null}
						<h2>{title}</h2>
						{lead ? <p className="site-content-lead">{lead}</p> : null}
						{paragraphs.map((paragraph, index) => (
							<p key={index}>{paragraph}</p>
						))}
						{ctaHref && ctaLabel ? (
							<Link href={ctaHref} className="blue_btn round_btn btn-brand-dark mt-3">
								{ctaLabel}
								<i className="ph ph-arrow-right"></i>
							</Link>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}

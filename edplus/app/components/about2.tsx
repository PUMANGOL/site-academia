"use client";

import Image from "next/image";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";
import VideoPlayer from "./video-player";

export default function AboutTwo({
	className = "",
	ctaHref = "/about",
	ctaLabelKey = "about.cta",
	showCta = true,
	showVideo = false,
	data,
}: {
	className?: string;
	ctaHref?: string;
	ctaLabelKey?: string;
	showCta?: boolean;
	showVideo?: boolean;
	data?: BlockData;
}) {
	const { t, text, flag, list, itemText } = useBlockContent("about", data);
	// Fora do construtor de páginas as props continuam a mandar.
	const buttonVisible = data ? flag("showButton") : showCta;
	const videoVisible = data ? flag("showVideo") : showVideo;
	const buttonHref = data ? text("buttonHref") : ctaHref;
	const buttonLabel = data ? text("buttonLabel") : t(ctaLabelKey);
	const photos = [
		{ src: text("image1"), alt: "Academia Pumangol, Talatona", className: "about-photo-main", sizes: "(max-width: 1199px) 100vw, 520px" },
		{ src: text("image2"), alt: "Recepção da Academia Pumangol", className: "about-photo-mid", sizes: "(max-width: 1199px) 50vw, 360px" },
		{ src: text("image3"), alt: "Sala de formação da Academia Pumangol", className: "about-photo-small", sizes: "(max-width: 1199px) 50vw, 360px" },
	];

	return (
		<section id="intro" className={`about-us-two position-relative section-padding ${className}`}>
			<div className="container">
				<div className={`row${text("imagePosition") === "right" ? " flex-xl-row-reverse" : ""}`}>
					<div className="col-xl-6 align-self-center wow fadeInUp">
						<div className="about-img position-relative">
							<div className="about-photos">
								{photos.map((photo) => (
									<div className={`about-photo ${photo.className}`} key={photo.className}>
										<Image
											src={photo.src}
											alt={photo.alt}
											fill
											sizes={photo.sizes}
											unoptimized={isExternal(photo.src)}
										/>
									</div>
								))}
							</div>

							<Image
								src="/assets/img/shapes/ab_dots.svg"
								className="ab_btm_shape position-absolute"
								alt=""
								width={120}
								height={120}
							/>
						</div>
					</div>

					<div className="col-xl-6 align-self-center">
						<div className="about-content position-relative">
							<div className="section-title mb30 wow fadeInUp">
								<span>
									<BrandMark />
									{text("eyebrow")}
								</span>

								<h2>{text("title")}</h2>

								<Image
									src="/assets/img/shapes/title.svg"
									alt=""
									width={216}
									height={20}
								/>
							</div>

							<p className="wow fadeInUp">{text("text")}</p>

							<div className="d-flex gap-4 aitem_wrap mb-4 position-relative z-2 wow fadeInUp">
								{list("items").map((item, index) => {
									const title = itemText(item, "title");
									const icon = itemText(item, "icon");
									return (
										<div className="about_item" key={index}>
											{icon ? (
												<Image
													src={icon}
													alt={title}
													width={60}
													height={60}
													unoptimized={isExternal(icon)}
												/>
											) : null}
											<h4>{title}</h4>
											<p>{itemText(item, "text")}</p>
										</div>
									);
								})}
							</div>

							{buttonVisible && buttonLabel ? (
								<Link href={buttonHref || "/about"} className="blue_btn round_btn wow fadeInUp">
									{buttonLabel}{" "}
									<i className="ph ph-arrow-right"></i>
								</Link>
							) : null}

							<Image
								src="/assets/img/icons/about/ed_cap.svg"
								className="ab_book_shape aniupDown position-absolute"
								alt=""
								width={120}
								height={120}
							/>
						</div>
					</div>
				</div>

				{videoVisible ? (
					<div className="about-video">
						<VideoPlayer />
					</div>
				) : null}
			</div>
		</section>
	);
}

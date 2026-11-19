"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function Features({ data }: { data?: BlockData }) {
	const { text, list, itemText } = useBlockContent("features", data);
	const features = list("items");
	const eyebrow = text("eyebrow");
	const title = text("title");
	const linkLabel = text("linkLabel");

	return (
		<section className="features section-padding">
			<div className="container">
				{eyebrow || title ? (
					<div className="section-title text-center wow fadeInUp">
						{eyebrow ? <span>{eyebrow}</span> : null}
						{title ? <h2>{title}</h2> : null}
						<Image
							src="/assets/img/shapes/title.svg"
							alt=""
							width={216}
							height={19}
							className="d-inline-block"
						/>
					</div>
				) : null}
				<Swiper
					modules={[Autoplay]}
					className="feature_slider position-relative"
					loop={features.length > 4}
					speed={1000}
					spaceBetween={30}
					autoplay={{
						delay: 2500,
						disableOnInteraction: false,
					}}
					breakpoints={{
						0: {
							slidesPerView: 1,
						},
						576: {
							slidesPerView: 2,
						},
						992: {
							slidesPerView: 3,
						},
						1200: {
							slidesPerView: 4,
						},
					}}
				>
					{features.map((feature, index) => {
						const featureTitle = itemText(feature, "title");
						const icon = itemText(feature, "icon");
						const href = itemText(feature, "href");
						return (
							<SwiperSlide key={index}>
								<div className="feature_item wow fadeInUp h-100">
									{icon ? (
										<div className="ficon">
											<Image
												src={icon}
												alt={featureTitle}
												width={60}
												height={60}
												unoptimized={isExternal(icon)}
											/>
										</div>
									) : null}

									<h3>{featureTitle}</h3>

									<p>{itemText(feature, "text")}</p>

									{href && linkLabel ? <Link href={href}>{linkLabel}..</Link> : null}
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</div>
		</section>
	);
}

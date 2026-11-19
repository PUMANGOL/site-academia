"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import VideoPopup from "../VideoPopup";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Testimonials() {
	const { t } = useI18n();
	const [open, setOpen] = useState(false);
	const [videoId, setVideoId] = useState("");
	const testimonials = [
		{
			id: 1,
			image: "/assets/img/testimonials/1.png",
			name: "John Smith",
			country: t("testimonialsPage.country"),
			content: t("testimonialsPage.quote"),
		},
		{
			id: 2,
			image: "/assets/img/testimonials/2.png",
			name: "John Smith",
			country: t("testimonialsPage.country"),
			content: t("testimonialsPage.quote"),
		},
	];

	return (
		<section
			className="testimonials section-padding"
			style={{
				backgroundImage:
					"url(/assets/img/bg/testimonials.jpg)",
			}}
		>
			<div className="container">
				<div className="row">
					<div className="col-xl-6 col-lg-6 col-12 text-center align-self-center wow fadeInUp">
						<div className="testi_content position-relative z-1">
							<Link
								href="#"
								className="vplay_btn"
								onClick={(e) => {
									setVideoId("qmqjJLzoxks");
									setOpen(true);
									e.preventDefault();
								}}
							>
								<i className="ph ph-play"></i>
							</Link>

							<h2>{t("testimonialsPage.video")}</h2>
						</div>
					</div>

					<div className="col-xl-6 col-lg-6 col-12 align-self-center position-relative wow fadeInUp">
						<div className="testimoinals_wrap position-relative z-1">
							<div className="section-title position-relative">
								<span>{t("testimonialsPage.eyebrow")}</span>
								<h2>{t("testimonialsPage.title")}</h2>

								<Image
									src="/assets/img/icons/quote.svg"
									alt=""
									width={70}
									height={70}
									className="quote_shape position-absolute"
								/>
							</div>

							{/* Navigation */}
							<div className="testimonial_nav">
								<button className="testimonial-prev">
									<i className="ph ph-arrow-left"></i>
								</button>

								<button className="testimonial-next">
									<i className="ph ph-arrow-right"></i>
								</button>
							</div>

							<Swiper
								modules={[Navigation, Autoplay]}
								loop={true}
								speed={1000}
								spaceBetween={30}
								autoplay={{
									delay: 3000,
									disableOnInteraction: false,
								}}
								navigation={{
									prevEl: ".testimonial-prev",
									nextEl: ".testimonial-next",
								}}
								className="testimonial_slider position-relative"
							>
								{testimonials.map((item) => (
									<SwiperSlide key={item.id}>
										<div className="testimonial_item">
											<div className="tes_top">
												<Image
													src={item.image}
													alt={item.name}
													width={70}
													height={70}
												/>

												<div className="tes_tdes">
													<h4>{item.name}</h4>
													<span>{item.country}</span>
												</div>
											</div>

											<p>{item.content}</p>

											<div className="tes_rating">
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
											</div>
										</div>
									</SwiperSlide>
								))}
							</Swiper>
						</div>

						<Image
							src="/assets/img/shapes/test_dots.svg"
							alt=""
							width={150}
							height={150}
							className="test_dots_shape anileftRight position-absolute"
						/>
					</div>
				</div>
			</div>

			<div className="testi_shape"></div>


			<VideoPopup
				open={open}
				setOpen={setOpen}
				videoId={videoId}
			/>
			
			<svg className="clippy">
				<defs>
					<clipPath
						id="clip-testishape"
						clipPathUnits="objectBoundingBox"
					>
						<path
							d="M0.00588182 0.00349918V0.00349918C0.00588182 -0.0104398 0.00753684 0.245551 0.00346267 0.258881C-0.01169 0.308459 0.0182551 0.330081 0.186573 0.23348C0.54222 0.0293686 0.401109 0.731278 0.740694 0.482379C1.08028 0.23348 0.98878 1 0.98878 1H0.00588182C0.00588182 1 0.00588182 0.0357386 0.00588182 0.00349918Z"
						/>
					</clipPath>
				</defs>
			</svg>
		</section>
	);
}
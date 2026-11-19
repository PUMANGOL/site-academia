"use client";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function TestimonialsTwo({ data }: { data?: BlockData }) {
	const { t, text, list, itemText } = useBlockContent("testimonials", data);
	const testimonials = list("items");
	const rating = text("rating");

	return (
		<section className="testimonials-two section-padding position-relative">
			<div className="container">
				<div className="row">
					<div className="col-xl-6 col-12 wow fadeInUp">
						<div className="section-title">
							<span>{text("eyebrow")}</span>

							<h2>
								{text("title")} <br />
								{text("title2")}
							</h2>

							<Image
								src="/assets/img/shapes/title.svg"
								alt=""
								width={216}
								height={19}
							/>
						</div>
					</div>

					<div className="col-xl-6 col-12 d-flex align-items-center justify-content-end">
						<div className="testimonial_nav">
							<button className="testimonial-prev">
								<i className="ph ph-arrow-left"></i>
							</button>

							<button className="testimonial-next">
								<i className="ph ph-arrow-right"></i>
							</button>
						</div>
					</div>
				</div>

				<div className="row">
					<div className="col-lg-4 col-12 text-center wow fadeInUp">
						<div
							className="test_badge"
							style={{
								backgroundImage: "url('/assets/img/bg/testimonials2.jpg')",
							}}
						>
							<h4>{rating}</h4>

							<i className="fa-solid fa-star"></i>
							<i className="fa-solid fa-star"></i>
							<i className="fa-solid fa-star"></i>
							<i className="fa-solid fa-star"></i>
							<i className="fa-solid fa-star"></i>

							<span>
								{rating} {t("banner.rating")}
							</span>
						</div>
					</div>

					<div className="col-lg-8 col-12 wow fadeInUp">
						<Swiper
							modules={[Autoplay, Navigation]}
							loop={testimonials.length > 2}
							spaceBetween={30}
							slidesPerView={1}
							speed={800}
							autoplay={{
								delay: 5000,
								disableOnInteraction: false,
							}}
							navigation={{
								prevEl: ".testimonial-prev",
								nextEl: ".testimonial-next",
							}}
							breakpoints={{
								768: {
									slidesPerView: 1,
								},
								1200: {
									slidesPerView: 2,
								},
							}}
							className="testimonial2_slider position-relative"
						>
							{testimonials.map((item, index) => {
								const name = itemText(item, "name");
								const photo = itemText(item, "photo");
								return (
									<SwiperSlide key={index}>
										<div className="testimonial2_item">
											<div className="tes_top">
												{photo ? (
													<Image
														src={photo}
														alt={name}
														width={70}
														height={70}
														unoptimized={isExternal(photo)}
													/>
												) : null}

												<div className="tes_tdes">
													<h4>{name}</h4>
													<span>{itemText(item, "role")}</span>
												</div>
											</div>

											<p>{itemText(item, "quote")}</p>

											<div className="tes_rating">
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
												<i className="fa-solid fa-star"></i>
											</div>

											<Image
												src="/assets/img/icons/quote.svg"
												alt=""
												width={50}
												height={50}
												className="quote_shape2 position-absolute"
											/>
										</div>
									</SwiperSlide>
								);
							})}
						</Swiper>
					</div>
				</div>
			</div>
		</section>
	);
}

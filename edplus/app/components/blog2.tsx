"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import { useI18n } from "@/app/i18n/I18nProvider";

const blogs = [
	{
		image: "/assets/img/blog/1.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2026",
		title: "Leverage agile frameworks to provide",
	
	},
	{
		image: "/assets/img/blog/2.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2026",
		title: "Leverage agile frameworks to provide",

	},
	{
		image: "/assets/img/blog/3.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2026",
		title: "Leverage agile frameworks to provide",
		
	},
	{
		image: "/assets/img/blog/1.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2026",
		title: "Leverage agile frameworks to provide",

	},
];

export default function BlogSection() {
	const { t } = useI18n();
	return (
		<section className="blog pb100">
			<div className="container">
				<div className="section-title text-center wow fadeInUp">
					<span>Blog</span>
					<h2>Latest News From our Blog</h2>
					<Image
						src="/assets/img/shapes/title.svg"
						alt=""
						width={216}
						height={19}
                        className="d-inline-block"
					/>
				</div>

				<div className="position-relative wow fadeInUp">
					<Swiper
						modules={[Autoplay, Navigation]}
						loop={true}
						speed={1000}
						spaceBetween={30}
						autoplay={{
							delay: 2500,
							disableOnInteraction: false,
						}}
						navigation={{
							prevEl: ".blog-prev",
							nextEl: ".blog-next",
						}}
						breakpoints={{
							0: {
								slidesPerView: 1,
							},
							768: {
								slidesPerView: 2,
							},
							1200: {
								slidesPerView: 3,
							},
						}}
						className="blog_slider"
					>
						{blogs.map((blog, index) => (
							<SwiperSlide key={index}>
								<div className="blog_item">
									<div className="blog_img">
										<Image
											src={blog.image}
											alt={blog.title}
											width={410}
											height={300}
										/>

										<span className="b_cat">
											<Link href='/blog-details'>
												<i className="ph ph-file"></i>{" "}
												{blog.category}
											</Link>
										</span>
									</div>

									<div className="blog_content">
										<div className="blog_meta">
											<span>
												<i className="ph ph-user"></i>{" "}
												{blog.author}
											</span>

											<span>
												<i className="ph ph-clock"></i>{" "}
												{blog.date}
											</span>
										</div>

										<h3>
											<Link href='/blog-details'>
												{blog.title}
											</Link>
										</h3>

										<Link
											href='/blog-details'
											className="blog_btn"
										>
											{t("features.learnMore")}{" "}
											<i className="ph ph-arrow-right"></i>
										</Link>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>

					<div className="owl-nav">
						<button
							type="button"
							className="owl-prev blog-prev"
						>
							<i className="ph ph-arrow-left"></i>
						</button>

						<button
							type="button"
							className="owl-next blog-next"
						>
							<i className="ph ph-arrow-right"></i>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
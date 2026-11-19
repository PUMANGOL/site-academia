"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import { useI18n } from "@/app/i18n/I18nProvider";

const blogs = [
	{
		id: 1,
		image: "/assets/img/blog/1.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2025",
		title: "Leverage agile frameworks to provide",
		url: "/blog-details",
	},
	{
		id: 2,
		image: "/assets/img/blog/2.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2025",
		title: "Leverage agile frameworks to provide",
		url: "/blog-details",
	},
	{
		id: 3,
		image: "/assets/img/blog/3.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2025",
		title: "Leverage agile frameworks to provide",
		url: "/blog-details",
	},
	{
		id: 4,
		image: "/assets/img/blog/1.jpg",
		category: "Software",
		author: "Masum Billah",
		date: "January 9, 2025",
		title: "Leverage agile frameworks to provide",
		url: "/blog-details",
	},
];

const blogSliderSettings = {
	modules: [Navigation, Autoplay],
	loop: true,
	speed: 800,
	spaceBetween: 30,
	autoplay: {
		delay: 5000,
		disableOnInteraction: false,
	},
	navigation: {
		prevEl: ".blog-prev",
		nextEl: ".blog-next",
	},
	breakpoints: {
		0: {
			slidesPerView: 1,
		},
		768: {
			slidesPerView: 2,
		},
		1200: {
			slidesPerView: 3,
		},
	},
};

export default function Blog() {
	const { t } = useI18n();
	return (
		<section className="blog">
			<div className="container">

				<div className="section-title text-center wow fadeInUp">
                        <span>{t("blog.eyebrow")}</span>

                        <h2>
                            {t("blog.title")} <br />
                            {t("blog.title2")}
                        </h2>

                        <Image
                            src="/assets/img/shapes/title.svg"
                            alt=""
                            width={216}
                            height={20}
                            className="d-inline-block"
                        />
                    </div>

				<Swiper
					{...blogSliderSettings}
					className="blog_slider wow fadeInUp"
				>
					{blogs.map((blog) => (
						<SwiperSlide key={blog.id}>
							<div className="blog_item">
								<div className="blog_img">
									<Image
										src={blog.image}
										alt={blog.title}
										width={410}
										height={280}
									/>

									<span className="b_cat">
										<Link href="#">
											<i className="ph ph-file"></i>{" "}
											{t("blog.category")}
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
											{t("blog.date")}
										</span>
									</div>

									<h3>
										<Link href={blog.url}>
											{t("blog.postTitle")}
										</Link>
									</h3>

									<Link
										href={blog.url}
										className="blog_btn2"
									>
										<i className="ph ph-arrow-right"></i>
									</Link>
								</div>
							</div>
						</SwiperSlide>
					))}
				</Swiper>

			</div>
		</section>
	);
}
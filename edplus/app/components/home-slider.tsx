"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { useI18n } from "@/app/i18n/I18nProvider";

const sliderSettings = {
	modules: [Navigation, Autoplay, EffectFade],
	loop: true,
	speed: 1200,
	effect: "slide",
	autoplay: {
		delay: 6000,
		disableOnInteraction: false,
	},
	navigation: {
		prevEl: ".home-prev",
		nextEl: ".home-next",
	},
	
};

export default function HomeSlider() {
	const { t } = useI18n();
	const sliderItems = [
	{
		id: 1,
		bgImage: "/assets/img/slider/1.jpg",
		badgeIcon: "/assets/img/icons/graduation-hat-white.svg",
		badgeText: t("slider.badge"),
		title: (
			<>
				{t("slider.title1a")}
				<br />
				{t("slider.title1b")}
			</>
		),
		description: t("banner.text"),
		buttonText: t("slider.cta"),
		buttonUrl: "/courses",
	},
	{
		id: 2,
		bgImage: "/assets/img/slider/2.jpg",
		badgeIcon: "/assets/img/icons/graduation-hat-white.svg",
		badgeText: t("slider.badge"),
		title: (
			<>
				{t("slider.title2a")}
				<br />
				{t("slider.title2b")}
			</>
		),
		description: t("banner.text"),
		buttonText: t("slider.cta"),
		buttonUrl: "/courses",
	},
];

	return (
		<section className="home-slider position-relative">
			<Swiper
				{...sliderSettings}
				className="active-hslider text-center position-relative"
			>
				{sliderItems.map((slide) => (
					<SwiperSlide key={slide.id}>
						<div
							className="hslider-item align-self-center"
							style={{
								backgroundImage: `url(${slide.bgImage})`,
							}}
						>
							<div className="container">
								<span className="animated">
									<Image
										src={slide.badgeIcon}
										alt=""
										width={30}
										height={30}
									/>
									{slide.badgeText}
								</span>

								<h2 className="animated">
									{slide.title}
								</h2>

								<p className="animated">
									{slide.description}
								</p>

								<Link
									href={slide.buttonUrl}
									className="blue_btn animated"
								>
									{slide.buttonText}
									{" "}
									<i className="ph ph-arrow-right"></i>
								</Link>
							</div>

							<div className="hslider_shapes position-absolute">
								<Image
									src="/assets/img/shapes/welcome.svg"
									className="lefttop position-absolute"
									alt="welcome"
									width={120}
									height={120}
								/>

								<Image
									src="/assets/img/shapes/star.svg"
									className="leftbtm position-absolute"
									alt="star"
									width={80}
									height={80}
								/>

								<Image
									src="/assets/img/shapes/madel.svg"
									className="ssright position-absolute"
									alt="madel"
									width={120}
									height={120}
								/>
							</div>
						</div>
					</SwiperSlide>
				))}
			</Swiper>

			{/* Owl Style Navigation */}

            <button
                type="button"
                role="presentation"
                className="hslider-prev home-prev"
            >
                <i className="ph ph-arrow-left"></i>
            </button>

            <button
                type="button"
                role="presentation"
                className="hslider-next home-next"
            >
                <i className="ph ph-arrow-right"></i>
            </button>
			
		</section>
	);
}
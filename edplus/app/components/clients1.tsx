"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const clientLogos = [
	"/assets/img/clients/1.svg",
	"/assets/img/clients/2.svg",
	"/assets/img/clients/3.svg",
	"/assets/img/clients/4.svg",
	"/assets/img/clients/5.svg",
	"/assets/img/clients/1.svg",
	"/assets/img/clients/2.svg",
	"/assets/img/clients/3.svg",
	"/assets/img/clients/4.svg",
];

export default function Clients() {
	return (
		<>
			{/* Start Client */}
			<div className="clients">
				<div className="container">
					<Swiper
						modules={[Autoplay]}
						loop={true}
						speed={1000}
						spaceBetween={30}
						autoplay={{
							delay: 2500,
							disableOnInteraction: false,
						}}
						breakpoints={{
							0: {
								slidesPerView: 2,
							},
							576: {
								slidesPerView: 3,
							},
							768: {
								slidesPerView: 4,
							},
							992: {
								slidesPerView: 5,
							},
						}}
						className="client_slider1 wow fadeInUp"
					>
						{clientLogos.map((logo, index) => (
							<SwiperSlide key={index}>
								<a href="#">
									<img
										src={logo}
										alt={`Client ${index + 1}`}
									/>
								</a>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
			{/* End Client */}
		</>
	);
}
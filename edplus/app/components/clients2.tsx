"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";

const clients = [
	{
		id: 1,
		image: "/assets/img/clients/1.svg",
		link: "#",
	},
	{
		id: 2,
		image: "/assets/img/clients/2.svg",
		link: "#",
	},
	{
		id: 3,
		image: "/assets/img/clients/3.svg",
		link: "#",
	},
	{
		id: 4,
		image: "/assets/img/clients/4.svg",
		link: "#",
	},
	{
		id: 5,
		image: "/assets/img/clients/5.svg",
		link: "#",
	},
	{
		id: 6,
		image: "/assets/img/clients/1.svg",
		link: "#",
	},
	{
		id: 7,
		image: "/assets/img/clients/2.svg",
		link: "#",
	},
	{
		id: 8,
		image: "/assets/img/clients/3.svg",
		link: "#",
	},
];

export default function ClientTwo() {
	return (
		<div className="client-two pb100">
			<div className="container position-relative">
                <div className="client_nav">
                        <button
                            type="button"
                            role="presentation"
                            className="cnav-prev client-prev"
                        >
                            <i className="ph ph-arrow-left"></i>
                        </button>

                        <button
                            type="button"
                            role="presentation"
                            className="cnav-next client-next"
                        >
                            <i className="ph ph-arrow-right"></i>
                        </button>
                    </div>  
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
                        prevEl: ".cnav-prev",
                        nextEl: ".cnav-next",
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
					className="client_slider2 position-relative wow fadeInUp"
				>

                    

					{clients.map((client) => (
						<SwiperSlide key={client.id}>
							<Link href={client.link}>
								<Image
									src={client.image}
									alt={`Client ${client.id}`}
									width={140}
									height={50}
								/>
							</Link>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</div>
	);
}
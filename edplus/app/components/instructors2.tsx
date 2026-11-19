"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import { useI18n } from "@/app/i18n/I18nProvider";

const teachersData = [
	{
		id: 1,
		image: "/assets/img/teachers/1.jpg",
		name: "MD. Monaym Billah",
		role: "english" as const,
	},
	{
		id: 2,
		image: "/assets/img/teachers/2.jpg",
		name: "MD. Motasim Billah",
		role: "english" as const,
	},
	{
		id: 3,
		image: "/assets/img/teachers/3.jpg",
		name: "MD. Masum Billah",
		role: "english" as const,
	},
	{
		id: 4,
		image: "/assets/img/teachers/4.jpg",
		name: "MD. Muntasir Billah",
		role: "english" as const,
	},
	{
		id: 5,
		image: "/assets/img/teachers/1.jpg",
		name: "MD. Masum Billah",
		role: "english" as const,
	},
];

export default function Teachers() {
	const { t } = useI18n();
	return (
        <>
<section className="teachers tstyle-1 section-padding">
			<div className="container">
				<div className="section-title text-center wow fadeInUp">
					<span>
						<span className="ticon">
							<img
								src="/assets/img/icons/title-icon.svg"
								alt=""
							/>
						</span>
						{t("instructors.eyebrow")}
					</span>

					<h2>{t("instructors.title")}</h2>

					<img
						src="/assets/img/shapes/title.svg"
						alt=""
                        className="d-inline-block"
					/>
				</div>

				<div className="row">
					<div className="col-12 wow fadeInUp">
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
									slidesPerView: 1,
								},
								576: {
									slidesPerView: 2,
								},
								768: {
									slidesPerView: 2,
								},
								992: {
									slidesPerView: 3,
								},
								1200: {
									slidesPerView: 4,
								},
							}}
							className="teacher_slider position-relative"
						>
							{teachersData.map((teacher) => (
								<SwiperSlide key={teacher.id}>
									<div className="teacher_item">
										<div className="teacher_image">
											<img
												src={teacher.image}
												alt={teacher.name}
											/>

											<ul className="tsocial_links">
												<li>
													<a href="#">
														<i className="fa-brands fa-facebook"></i>
													</a>
												</li>

												<li>
													<a href="#">
														<i className="fa-brands fa-x-twitter"></i>
													</a>
												</li>

												<li>
													<a href="#">
														<i className="fa-brands fa-youtube"></i>
													</a>
												</li>
											</ul>
										</div>

										<div className="teacher_content">
											<h4>
												<Link href="/instructor-details">
													{teacher.name}
												</Link>
											</h4>

											<span>
												{t(`instructors.${teacher.role}`)}
											</span>
										</div>
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				</div>
			</div>
		</section>

        <svg className="clippy">
            <defs>
                <clipPath id="clip-teacher" clipPathUnits="objectBoundingBox">
                    <path d="M0 0.0211625C0 0.00947477 0.00992167 0 0.0221607 0H0.792244C0.815192 0 0.833795 0.0177652 0.833795 0.0396796V0.283048V0.468717C0.833795 0.488236 0.84866 0.504856 0.868848 0.507909L0.964947 0.522439C0.985135 0.525491 1 0.542112 1 0.56163V0.815965C1 0.824911 0.994109 0.832891 0.985286 0.835897L0.507279 0.998769C0.502566 1.00038 0.497422 1.00041 0.492685 0.998869L0.0150135 0.843448C0.00603581 0.840527 0 0.832473 0 0.823416V0.0211625Z" fill="#222222"/>
                </clipPath>
            </defs>
        </svg>
        </>
		
	);
}
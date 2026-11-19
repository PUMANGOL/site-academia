"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import { useI18n } from "@/app/i18n/I18nProvider";

const instructors = [
	{
		id: 1,
		image: "/assets/img/teachers/ins/1.jpg",
		name: "MD. Monaym Billah",
		role: "english" as const,
		courses: 54,
		students: 125,
	},
	{
		id: 2,
		image: "/assets/img/teachers/ins/2.jpg",
		name: "MD. Monaym Billah",
		role: "english" as const,
		courses: 35,
		students: 125,
	},
	{
		id: 3,
		image: "/assets/img/teachers/ins/3.jpg",
		name: "MD. Monaym Billah",
		role: "developer" as const,
		courses: 23,
		students: 125,
	},
	{
		id: 4,
		image: "/assets/img/teachers/ins/4.jpg",
		name: "MD. Monaym Billah",
		role: "developer" as const,
		courses: 60,
		students: 125,
	},
	{
		id: 5,
		image: "/assets/img/teachers/ins/1.jpg",
		name: "MD. Monaym Billah",
		role: "developer" as const,
		courses: 18,
		students: 125,
	},
	{
		id: 6,
		image: "/assets/img/teachers/ins/2.jpg",
		name: "MD. Monaym Billah",
		role: "developer" as const,
		courses: 25,
		students: 125,
	},
];

export default function Instructors() {
	const { t } = useI18n();
	return (
		<>
			<section className="instructors section-padding">
				<div className="container">
					<div className="row">
						<div className="col-12 wow fadeInUp">
							<div className="section-title text-center">
								<span>{t("instructors.eyebrow")}</span>
								<h2>{t("instructors.title")}</h2>
								<Image
									src="/assets/img/shapes/title.svg"
									alt=""
									width={217}
									height={20}
									className="d-inline-block"
								/>
							</div>
						</div>
					</div>

					<Swiper
						modules={[Autoplay]}
						autoplay={{
							delay: 5000,
							disableOnInteraction: false,
						}}
						loop={true}
						speed={800}
						spaceBetween={30}
						breakpoints={{
							0: { slidesPerView: 1 },
							576: { slidesPerView: 2 },
							992: { slidesPerView: 3 },
							1200: { slidesPerView: 4 },
						}}
						className="instructor-slider position-relative wow fadeInUp"
					>
						{instructors.map((teacher) => (
							<SwiperSlide key={teacher.id}>
								<div className="teacher_item">
									<div className="teacher_image">
										<Image
											src={teacher.image}
											alt={teacher.name}
											width={300}
											height={350}
										/>
										<ul className="tsocial_links">
											<li>
												<Link href="#">
													<i className="fa-brands fa-facebook"></i>
												</Link>
											</li>
											<li>
												<Link href="#">
													<i className="fa-brands fa-x-twitter"></i>
												</Link>
											</li>
											<li>
												<Link href="#">
													<i className="fa-brands fa-youtube"></i>
												</Link>
											</li>
										</ul>
									</div>
									<div className="teacher_content">
										<h4>
											<Link href="/instructor-details">{teacher.name}</Link>
										</h4>
										<span>{t(`instructors.${teacher.role}`)}</span>
										<div className="ins_meta">
											<span>
												<i className="fa-solid fa-book"></i>{" "}
												{t("instructors.courses", { count: teacher.courses })}
											</span>
											<span>
												<i className="fa-solid fa-graduation-cap"></i>{" "}
												{t("instructors.students", { count: teacher.students })}
											</span>
										</div>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</section>
			<svg className="clippy">
				<defs>
					<clipPath id="clip-instructor" clipPathUnits="objectBoundingBox">
						<path d="M0 0.0252417C0 0.0113011 0.00992167 0 0.0221607 0H0.792244C0.815192 0 0.833795 0.0211896 0.833795 0.0473283V0.337608V0.559067C0.833795 0.582348 0.84866 0.602172 0.868848 0.605813L0.964947 0.623144C0.985135 0.626785 1 0.646609 1 0.66989V0.966005C1 0.979866 0.990187 0.991134 0.978018 0.991246L0.0223388 0.999999C0.0100306 1.00011 0 0.988778 0 0.974758V0.0252417Z" fill="#222222"/>
					</clipPath>
				</defs>
			</svg>
		</>
	);
}

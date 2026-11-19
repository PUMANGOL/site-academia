"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import VideoPopup from "../VideoPopup";
import { localizeCourses } from "@/app/data/courses";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Courses() {
	const { t } = useI18n();
	const [open, setOpen] = useState(false);
	const [videoId, setVideoId] = useState("");
	const courses = localizeCourses(t);

	return (
		<section className="courses section-padding">
			<div className="container">
				<div className="row align-items-center course_top mb-5">
					<div className="col-md-6 col-12 wow fadeInUp">
						<p className="ccount_result">
							{t("courses.showing", { shown: 6 })} <span>{t("courses.showingSpan")}</span> {t("courses.showingOf", { total: 6 })}
						</p>
					</div>

					<div className="col-md-6 col-12 text-md-end wow fadeInUp">
						<div className="csearch_form">
							<form action="#" method="get">
								<input
									type="text"
									className="csearch_input"
									placeholder={t("courses.searchPlaceholder")}
								/>
							</form>
						</div>
					</div>
				</div>

				<div className="row gy-4 course_item">
					{courses.map((course, index) => (
						<div
							key={index}
							className="col-xl-4 col-md-6 col-12 wow fadeInUp"
						>
							<div className="single_course">
								<div className="course_img">
									<div className="ccategory">
										<Link href="#">
											<i className="ph ph-folder-open"></i>{" "}
											{course.category}
										</Link>
									</div>

									<Image
										src={course.image}
										alt={course.title}
										width={410}
										height={280}
									/>

									<Link
										href="#"
										className="cvbtn"
										onClick={(e) => {
											setVideoId(course.videoId);   
											e.preventDefault();
											setOpen(true);
										}}
									>
										<i className="ph ph-video-camera"></i>
									</Link>
								</div>

								<div className="course_content">
									<div className="crating_number">
										<i className="fa-solid fa-star"></i>{" "}
										{t("courses.rating", { rating: course.rating, count: 3 })}
									</div>

									<h3>
										<Link href="/course-details">
											{course.title}
										</Link>
									</h3>

									<div className="cmeta d-flex gap-5">
										<div className="single_meta">
											<i className="fa-solid fa-book"></i>{" "}
											{course.lessonsLabel}
										</div>

										<div className="single_meta">
											<i className="fa-regular fa-user"></i>{" "}
											{course.studentsLabel}
										</div>
									</div>

									<div className="cbtm">
										<div className="c_price float-start">
											{course.price}
										</div>

										<div className="c_author float-end">
											<Image
												src="/assets/img/courses/author/1.png"
												alt="Dev. Masum Billah"
												width={30}
												height={30}
                                                className="d-inline-block"
											/>

											<Link href="#">
												Dev. Masum Billah
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}

					<div className="col-12 text-center wow fadeInUp">
						<div className="post_pagination">
							<ul>
								<li>
									<Link href="#">
										<i className="ph ph-arrow-left"></i>
									</Link>
								</li>
								<li>
									<Link href="#">1</Link>
								</li>
								<li className="active">
									<Link href="#">2</Link>
								</li>
								<li>
									<Link href="#">3</Link>
								</li>
								<li>
									<Link href="#">
										<i className="ph ph-arrow-right"></i>
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<VideoPopup
				open={open}
				setOpen={setOpen}
				videoId={videoId}
			/>
		</section>
	);
}
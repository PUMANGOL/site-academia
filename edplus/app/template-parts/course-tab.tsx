"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function CourseTabs() {
	const { t } = useI18n();
	const [activeTab, setActiveTab] = useState("overview");

	const tabs = [
		{ id: "overview", label: t("courseDetails.tabOverview") },
		{ id: "curriculum", label: t("courseDetails.tabCurriculum") },
		{ id: "review", label: t("courseDetails.tabReview") },
		{ id: "instructor", label: t("courseDetails.tabInstructor") },
	];

	const curriculum = [
		{ icon: "bx bx-play-circle", title: t("courseDetails.lessonIntro"), minutes: 10 },
		{ icon: "bx bx-play-circle", title: t("courseDetails.lessonOverview"), minutes: 8 },
		{ icon: "bx bx-folder", title: t("courseDetails.lessonBasic"), minutes: 7 },
		{ icon: "bx bx-bulb", title: t("courseDetails.quiz"), minutes: 5 },
		{ icon: "bx bx-play-circle", title: t("courseDetails.lessonIntro"), minutes: 10 },
		{ icon: "bx bx-bulb", title: t("courseDetails.lessonOverview"), minutes: 30 },
	];

	const ratingRows = [
		{ stars: 5, width: "100%", count: 3 },
		{ stars: 4, width: "80%", count: 2 },
		{ stars: 3, width: "60%", count: 1 },
		{ stars: 2, width: "40%", count: 2 },
		{ stars: 1, width: "20%", count: 2 },
	];

	return (
		<>
			<nav className="cd_tab">
				<div className="nav nav-tabs" id="nav-tab" role="tablist">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.label}
						</button>
					))}
				</div>
			</nav>

			<div className="tab-content mt-4">
				{activeTab === "overview" && (
					<div id="nav-overview" className="tab-pane fade show active">
						<h3 className="cdtitle">{t("courseDetails.description")}</h3>
						<p>{t("courseDetails.desc1")}</p>
						<p>{t("courseDetails.desc2")}</p>
						<p>{t("courseDetails.desc3")}</p>

						<div className="benefits">
							<h3>{t("courseDetails.whyLearn")}</h3>
							<ul>
								{Array.from({ length: 6 }).map((_, index) => (
									<li key={index}>{t("courseDetails.benefit")}</li>
								))}
							</ul>
						</div>
					</div>
				)}

				{activeTab === "curriculum" && (
					<div className="tab-pane fade show active">
						<div className="cd_curriculum">
							<h3>{t("courseDetails.curriculumTitle")}</h3>
							<ul>
								{curriculum.map((lesson, index) => (
									<li key={index}>
										<span>
											<Link href="#">
												<i className={lesson.icon}></i> {lesson.title}
											</Link>
										</span>
										<span className="cd_cur_right">
											<Link href="#" className="cbtn">
												{t("courseDetails.preview")}
											</Link>
											{t("courseDetails.minutes", { count: lesson.minutes })}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				)}

				{activeTab === "review" && (
					<div className="tab-pane fade show active">
						<div className="cd_rating">
							<h3>{t("courseDetails.studentReviews")}</h3>

							<div className="cd_rating_top">
								<div className="cdr_rate_summary">
									<h1>5.0</h1>
									<span className="cdr_rating">
										<i className="bx bxs-star"></i>
										<i className="bx bxs-star"></i>
										<i className="bx bxs-star"></i>
										<i className="bx bxs-star"></i>
										<i className="bx bxs-star"></i>
									</span>
									<p>{t("courseDetails.totalRating", { count: 3 })}</p>
								</div>

								<div className="cdr_rate_number">
									<ul>
										{ratingRows.map((row) => (
											<li key={row.stars}>
												<span className="cdr_rate_star">{row.stars}</span>
												<span className="cdr_rate_value">
													<span
														className="rating_width"
														style={{ width: row.width }}
													></span>
													<span className="cdr_rate_count">
														{t("courseDetails.ratingCount", { count: row.count })}
													</span>
												</span>
											</li>
										))}
									</ul>
								</div>
							</div>

							<div className="rating_list">
								{[1, 2, 3].map((item) => (
									<div className="rating_item" key={item}>
										<div className="rating_item_avatar">
											<Image
												src={
													item === 1
														? "/assets/img/review/1.jpg"
														: `/assets/img/review/${item}.png`
												}
												alt="avatar"
												width={70}
												height={70}
											/>
											<div className="rava_conent">
												<h3>Robert Max</h3>
												<p>{t("courseDetails.outstanding")}</p>
												<span className="rating_item_ricon">
													<i className="bx bxs-star"></i>
													<i className="bx bxs-star"></i>
													<i className="bx bxs-star"></i>
													<i className="bx bxs-star"></i>
													<i className="bx bxs-star"></i>
												</span>
											</div>
										</div>
										<div className="rating_item_content">
											<p>&ldquo; {t("courseDetails.reviewText")} &rdquo;</p>
										</div>
									</div>
								))}
							</div>

							<div className="cdr_review_form">
								<h3>{t("courseDetails.addReview")}</h3>
								<div className="review_form_ricon">
									<i className="bx bxs-star"></i>
									<i className="bx bxs-star"></i>
									<i className="bx bxs-star"></i>
									<i className="bx bxs-star"></i>
									<i className="bx bxs-star"></i>
								</div>
								<form action="#" className="rating_form">
									<textarea
										name="rating_form"
										placeholder={t("courseDetails.writeReview")}
									></textarea>
									<br />
									<button type="submit" className="blue_btn round_btn py40">
										{t("courseDetails.submitReview")}
									</button>
								</form>
							</div>
						</div>
					</div>
				)}

				{activeTab === "instructor" && (
					<div className="tab-pane fade show active">
						<div className="cd_instructor">
							<div className="cdin_image">
								<Image
									src="/assets/img/teachers/1.jpg"
									alt="Masum Billah"
									width={300}
									height={350}
									className="img-fluid"
								/>
								<ul>
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
							<div className="cdin_content">
								<h4>
									<Link href="#">Masum Billah</Link>
								</h4>
								<span>{t("courseDetails.webDesigner")}</span>
								<p>{t("courseDetails.instructorBio")}</p>
								<div className="cdin_meta">
									<div className="cdin_meta_item">
										<i className="fa-solid fa-graduation-cap"></i>{" "}
										{t("courseDetails.studentsPlus", { count: 25 })}
									</div>
									<div className="cdin_meta_item">
										<i className="fa-solid fa-file-circle-check"></i>{" "}
										{t("courseDetails.coursesCount", { count: 32 })}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

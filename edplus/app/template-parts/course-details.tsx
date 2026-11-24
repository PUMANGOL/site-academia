"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import VideoPopup from "../VideoPopup";
import FreeEnrollmentModal from "@/app/components/free-enrollment-modal";
import { useI18n } from "@/app/i18n/I18nProvider";
import { useCart } from "@/app/providers/cart-provider";
import type { CourseDetail } from "@/db/queries/courses";
import { formatPrice, getCoursePricing, pickLocale } from "@/lib/i18n-content";

const skillLevelKeys: Record<string, string> = {
	beginner: "courseDetails.skillBeginner",
	intermediate: "courseDetails.skillIntermediate",
	advanced: "courseDetails.skillAdvanced",
};

const modalityKeys: Record<string, string> = {
	in_person: "courseDetails.modalityInPerson",
	online: "courseDetails.modalityOnline",
};

const languageKeys: Record<string, string> = {
	pt: "courseDetails.languagePt",
	en: "courseDetails.languageEn",
};

export default function CourseDetails({ course }: { course: CourseDetail }) {
	const [open, setOpen] = useState(false);
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [enrolled, setEnrolled] = useState(false);
	const [activeTab, setActiveTab] = useState<"overview" | "instructors">("overview");
	const { t, locale } = useI18n();
	const { addCourse } = useCart();
	const router = useRouter();

	const title = pickLocale(course.title, locale);
	const category = pickLocale(course.categoryName, locale);
	const description =
		pickLocale(course.description, locale) || pickLocale(course.excerpt, locale);
	const objectives = pickLocale(course.objectives, locale)
		.split("\n")
		.map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
		.filter(Boolean);
	const [leadInstructor, ...otherInstructors] = course.instructors;
	const dateFormatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pt-PT", {
		dateStyle: "long",
	});
	// Datas "YYYY-MM-DD" sem hora: interpretar em UTC para não mudar de dia.
	const formatDay = (value: string) =>
		dateFormatter.format(new Date(`${value}T00:00:00Z`));
	const schedule =
		course.startDate && course.endDate && course.endDate !== course.startDate
			? `${formatDay(course.startDate)} – ${formatDay(course.endDate)}`
			: course.startDate
				? formatDay(course.startDate)
				: null;
	const soldOut = course.seatsLeft === 0;
	const pricing = getCoursePricing(course);
	const rating = Number(course.ratingAvg);

	async function handleEnroll() {
		if (pricing.onRequest) return;
		if (pricing.isFree) {
			setConfirmOpen(true);
			return;
		}

		setAdding(true);
		setError(null);
		const result = await addCourse(course.id);
		setAdding(false);
		if (result.ok) {
			router.push("/cart");
		} else {
			setError(result.error ?? null);
		}
	}

	function formatDuration(minutes: number) {
		const hours = Math.floor(minutes / 60);
		const rest = minutes % 60;
		if (!hours) return t("courseDetails.minutes", { count: rest });
		if (!rest) return t("courseDetails.hours", { count: hours });
		return `${t("courseDetails.hours", { count: hours })} ${t("courseDetails.minutes", { count: rest })}`;
	}

	return (
		<section className="courses-details section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-8 wow fadeIn">
						<h1 className="cdtitle mb-4">{title}</h1>

						<div className="scourse_image">
							<Image
								src={course.imageUrl}
								alt={title}
								width={1200}
								height={700}
								className="img-fluid"
							/>

							{course.videoId ? (
								<div className="vid_btn_wrap">
									<Link
										href="#"
										className="vplay_btn"
										onClick={(e) => {
											e.preventDefault();
											setOpen(true);
										}}
									>
										<i className="ph ph-play"></i>
									</Link>
								</div>
							) : null}
						</div>

						<div className="scourse_meta">
							{leadInstructor ? (
								<div className="smeta">
									<Image
										src={leadInstructor.photoUrl}
										alt={leadInstructor.name}
										width={60}
										height={60}
									/>

									<div className="smeta_text">
										<span>
											{otherInstructors.length
												? t("courseDetails.instructors")
												: t("courseDetails.instructor")}
										</span>
										<p>
											{leadInstructor.name}
											{otherInstructors.length
												? ` ${t("courseDetails.andMore", { count: otherInstructors.length })}`
												: ""}
										</p>
									</div>
								</div>
							) : null}

							{category ? (
								<div className="smeta">
									<span>{t("courseDetails.category")}</span>
									<p>{category}</p>
								</div>
							) : null}

							<div className="smeta">
								<span>{t("courseDetails.lastUpdate")}</span>
								<p>{dateFormatter.format(new Date(course.updatedAt))}</p>
							</div>

							<div className="smeta">
								<span>{t("courseDetails.review")}</span>
								<p>
									<span className="rev_icons">
										{Array.from({ length: 5 }).map((_, index) => (
											<i
												key={index}
												className={index < Math.round(rating) ? "bx bxs-star" : "bx bx-star"}
											></i>
										))}
									</span>
									<span className="rev_content">
										({rating.toFixed(1)}) · {course.reviewsCount}{" "}
										{t("courseDetails.reviews")}
									</span>
								</p>
							</div>
						</div>

						<nav className="cd_tab">
							<div className="nav nav-tabs" role="tablist">
								<button
									type="button"
									className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
									onClick={() => setActiveTab("overview")}
								>
									{t("courseDetails.tabOverview")}
								</button>
								{course.instructors.length ? (
									<button
										type="button"
										className={`nav-link ${activeTab === "instructors" ? "active" : ""}`}
										onClick={() => setActiveTab("instructors")}
									>
										{course.instructors.length > 1
											? t("courseDetails.tabInstructors")
											: t("courseDetails.tabInstructor")}
									</button>
								) : null}
							</div>
						</nav>

						<div className="tab-content mt-4">
							{activeTab === "overview" && (
								<div className="tab-pane fade show active">
									<h3 className="cdtitle">{t("courseDetails.description")}</h3>
									{description ? (
										description
											.split(/\n{2,}/)
											.map((paragraph, index) => <p key={index}>{paragraph}</p>)
									) : (
										<p>{t("courseDetails.noDescription")}</p>
									)}

									{objectives.length ? (
										<div className="benefits">
											<h3>{t("courseDetails.objectives")}</h3>
											<ul>
												{objectives.map((objective, index) => (
													<li key={index}>{objective}</li>
												))}
											</ul>
										</div>
									) : null}
								</div>
							)}

							{activeTab === "instructors" && (
								<div className="tab-pane fade show active">
									{course.instructors.map((instructor) => (
										<div className="cd_instructor mb-4" key={instructor.slug}>
											<div className="cdin_image">
												<Image
													src={instructor.photoUrl}
													alt={instructor.name}
													width={300}
													height={350}
													className="img-fluid"
												/>
											</div>
											<div className="cdin_content">
												<h4>
													<Link href={`/instructors/${instructor.slug}`}>{instructor.name}</Link>
												</h4>
												<span>{pickLocale(instructor.headline, locale)}</span>
												<p>{pickLocale(instructor.bio, locale)}</p>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
					{/* End Col*/}

					<div className="col-xl-4 wow fadeIn">
						<div className="course-sidebar">
							{course.videoId ? (
								<div className="cd-video mb-3">
									<iframe
										width="560"
										height="315"
										src={`https://www.youtube.com/embed/${course.videoId}`}
										title={title}
										allowFullScreen
									></iframe>
								</div>
							) : null}

							<div className="cd_price mb-3">
								{pricing.originalPrice !== null ? (
									<>
										<del>{formatPrice(pricing.originalPrice, course.currency)}</del>{" "}
									</>
								) : null}
								<span>
									{pricing.onRequest
										? t("courses.onRequest")
										: pricing.isFree
											? t("courseDetails.free")
											: formatPrice(pricing.price, course.currency)}
								</span>
							</div>

							<div className="text-start mb-4">
								{enrolled ? (
									<>
										<p className="course-enrolled-notice">
											<i className="ph ph-check-circle" aria-hidden />
											{t("courseDetails.enrolledNotice")}
										</p>
										<Link href="/aluno/cursos" className="blue_btn round_btn btn-brand-dark py40">
											{t("courseDetails.goToMyCourses")} <i className="ph ph-arrow-right"></i>
										</Link>
									</>
								) : pricing.onRequest ? (
									<Link href="/contact" className="blue_btn round_btn btn-brand-dark py40">
										{t("courses.onRequestCta")} <i className="ph ph-arrow-right"></i>
									</Link>
								) : (
									<button
										type="button"
										className="blue_btn round_btn btn-brand-dark py40"
										onClick={handleEnroll}
										disabled={adding || soldOut}
									>
										{soldOut
											? t("courseDetails.soldOut")
											: adding
												? t("cart.adding")
												: pricing.isFree
													? t("courseDetails.enrollFree")
													: t("courseDetails.enrollNow")}{" "}
										{!soldOut && !adding ? <i className="ph ph-arrow-right"></i> : null}
									</button>
								)}
								{error ? <p className="text-danger mt-2 mb-0">{error}</p> : null}
							</div>

							<ul className="scourse_list">
								<li>
									<span className="cside-label">
										<i
											className={
												course.modality === "online"
													? "fa-solid fa-laptop"
													: "fa-solid fa-location-dot"
											}
										></i>{" "}
										{t("courseDetails.modality")}
									</span>
									<span className="cside-value">
										{pricing.onRequest
											? t("courses.formats")
											: t(modalityKeys[course.modality] ?? "courseDetails.modalityInPerson")}
									</span>
								</li>

								{schedule ? (
									<li>
										<span className="cside-label">
											<i className="fa-regular fa-calendar"></i> {t("courseDetails.dates")}
										</span>
										<span className="cside-value">{schedule}</span>
									</li>
								) : null}

								{course.durationMinutes ? (
									<li>
										<span className="cside-label">
											<i className="fa-regular fa-clock"></i> {t("courseDetails.duration")}
										</span>
										<span className="cside-value">
											{formatDuration(course.durationMinutes)}
										</span>
									</li>
								) : null}

								{course.lessonsCount > 0 ? (
									<li>
										<span className="cside-label">
											<i className="fa-regular fa-file"></i> {t("courseDetails.lesson")}
										</span>
										<span className="cside-value">{course.lessonsCount}</span>
									</li>
								) : null}

								<li>
									<span className="cside-label">
										<i className="fa-solid fa-chair"></i> {t("courseDetails.seats")}
									</span>
									<span className="cside-value">
										{course.seats ?? t("courseDetails.seatsUnlimited")}
									</span>
								</li>

								<li>
									<span className="cside-label">
										<i className="fa-solid fa-graduation-cap"></i> {t("courseDetails.enrolled")}
									</span>
									<span className="cside-value">{course.studentsCount}</span>
								</li>

								{course.seatsLeft !== null ? (
									<li>
										<span className="cside-label">
											<i className="fa-solid fa-circle-check"></i> {t("courseDetails.seatsLeft")}
										</span>
										<span className="cside-value">{course.seatsLeft}</span>
									</li>
								) : null}

								<li>
									<span className="cside-label">
										<i className="fa-solid fa-chart-line"></i> {t("courseDetails.skillLevel")}
									</span>
									<span className="cside-value">
										{t(skillLevelKeys[course.skillLevel] ?? "courseDetails.skillBeginner")}
									</span>
								</li>

								<li>
									<span className="cside-label">
										<i className="fa-solid fa-language"></i> {t("courseDetails.language")}
									</span>
									<span className="cside-value">
										{languageKeys[course.language]
											? t(languageKeys[course.language])
											: course.language.toUpperCase()}
									</span>
								</li>
							</ul>
						</div>
					</div>
					{/* End Col*/}
				</div>
			</div>

			{course.videoId ? (
				<VideoPopup open={open} setOpen={setOpen} videoId={course.videoId} />
			) : null}

			{confirmOpen ? (
				<FreeEnrollmentModal
					onClose={() => setConfirmOpen(false)}
					onEnrolled={() => setEnrolled(true)}
					course={{
						id: course.id,
						slug: course.slug,
						title,
						details: [
							t(modalityKeys[course.modality] ?? "courseDetails.modalityInPerson"),
							schedule,
						]
							.filter(Boolean)
							.join(" · "),
					}}
				/>
			) : null}
		</section>
	);
}

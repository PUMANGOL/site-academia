"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import VideoPopup from "../VideoPopup";
import CourseCard from "@/app/components/course-card";
import { isExternal } from "@/app/components/page-blocks/use-block-content";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { CourseListItem } from "@/db/queries/courses";
import type { PublicInstructor } from "@/db/queries/instructors";
import { pickLocale } from "@/lib/i18n-content";

export default function InstructorProfile({
	instructor,
	courses,
}: {
	instructor: PublicInstructor;
	courses: CourseListItem[];
}) {
	const { t, locale } = useI18n();
	const [open, setOpen] = useState(false);
	const [videoId, setVideoId] = useState("");
	// Parágrafos separados por uma linha em branco, como na descrição dos cursos.
	const bio = pickLocale(instructor.bio, locale)
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return (
		<>
			<div className="instructor-details pt100">
				<div className="container">
					<div className="row gy-4">
						<div className="col-lg-5">
							<div className="id_image text-start text-lg-center">
								<Image
									src={instructor.photoUrl}
									alt={instructor.name}
									width={460}
									height={520}
									className="instructor-profile-photo"
									unoptimized={isExternal(instructor.photoUrl)}
								/>
								<div className="id_meta mt-4 mb-2 pb-2">
									<span>
										<i className="fa-solid fa-book"></i>{" "}
										{t("instructors.courses", { count: instructor.coursesCount })}
									</span>
									<span>
										<i className="fa-solid fa-user"></i>{" "}
										{t("instructors.students", { count: instructor.studentsCount })}
									</span>
								</div>
							</div>
						</div>

						<div className="col-lg-7">
							<div className="id_content">
								<h3>{instructor.name}</h3>
								<span>{pickLocale(instructor.headline, locale)}</span>
								{bio.length ? (
									<>
										<h4>{t("instructorPage.about")}</h4>
										{bio.map((paragraph, index) => (
											<p key={index}>{paragraph}</p>
										))}
									</>
								) : null}
								<Link href="/instructors" className="blue_btn round_btn mt-3">
									<i className="ph ph-arrow-left" aria-hidden /> {t("instructorPage.back")}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			<section className="courses pb100 pt-5">
				<div className="container">
					<div className="section-title text-start">
						<span>{t("instructorPage.myCourses")}</span>
						<h2>{t("instructorPage.coursesBy", { name: instructor.name.split(" ")[0] })}</h2>
					</div>
					<div className="row gy-4">
						{courses.length ? (
							courses.map((course) => (
								<div className="col-xl-4 col-md-6 col-12 d-flex" key={course.id}>
									<CourseCard
										course={course}
										onPlay={(id) => {
											setVideoId(id);
											setOpen(true);
										}}
									/>
								</div>
							))
						) : (
							<div className="col-12">
								<p>{t("instructorPage.noCourses")}</p>
							</div>
						)}
					</div>
				</div>
				<VideoPopup open={open} setOpen={setOpen} videoId={videoId} />
			</section>
		</>
	);
}

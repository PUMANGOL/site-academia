"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPopup from "../VideoPopup";
import CourseCard from "@/app/components/course-card";
import BrandMark from "@/app/components/brand-mark";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";
import type { CourseListItem } from "@/db/queries/courses";

export default function Courses1({
	courses,
	data,
}: {
	courses: CourseListItem[];
	data?: BlockData;
}) {
	const { t, text } = useBlockContent("courses", data);
	const [activeTab, setActiveTab] = useState("all");
	const [open, setOpen] = useState(false);
	const [videoId, setVideoId] = useState("");
	const tabs = [
		{ id: "all", label: t("courses.all") },
		{ id: "seguranca", label: t("courses.safety") },
		{ id: "operacoes", label: t("courses.operations") },
		{ id: "lideranca", label: t("courses.leadership") },
	];

	const filteredCourses =
		activeTab === "all"
			? courses
			: courses.filter((course) => course.categorySlugs.includes(activeTab));

	return (
		<>
			<section className="courses">
				<div className="container">
					<div className="row">
						<div className="col-lg-6 wow fadeInUp">
							<div className="section-title">
								<span>
									<BrandMark />
									{text("eyebrow")}
								</span>
								<h2>{text("title")}</h2>
							</div>
						</div>

						<div className="col-lg-6 align-self-center wow fadeInUp">
							<nav className="course_nav text-lg-end">
								<ul>
									{tabs.map((tab) => (
										<li
											key={tab.id}
											className={activeTab === tab.id ? "active" : ""}
											onClick={() => setActiveTab(tab.id)}
										>
											{tab.label}
										</li>
									))}
								</ul>
							</nav>
						</div>
					</div>

					<div className="row gy-4">
						{filteredCourses.length === 0 ? (
							<div className="col-12">
								<p>{t("courses.empty")}</p>
							</div>
						) : null}
						<AnimatePresence mode="wait">
							{filteredCourses.map((course) => (
								<motion.div
									key={course.id}
									layout
									initial={{ opacity: 0, y: 30, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -30, scale: 0.95 }}
									transition={{ duration: 0.4, ease: "easeOut" }}
									className="col-xl-4 col-md-6 col-12 wow fadeInUp d-flex"
								>
									<CourseCard
										course={course}
										onPlay={(id) => {
											setVideoId(id);
											setOpen(true);
										}}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</div>

				<VideoPopup open={open} setOpen={setOpen} videoId={videoId} />
			</section>
		</>
	);
}

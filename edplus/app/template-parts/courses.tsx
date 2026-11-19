"use client";
import { useMemo, useRef, useState } from "react";
import VideoPopup from "../VideoPopup";
import CourseCard from "@/app/components/course-card";
import BrandMark from "@/app/components/brand-mark";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";
import type { CourseListItem } from "@/db/queries/courses";
import { matchesAllTerms } from "@/lib/search";

function pageItems(current: number, total: number): Array<number | "gap"> {
	if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
	const pages = [1, total, current - 1, current, current + 1].filter(
		(page) => page >= 1 && page <= total
	);
	const unique = [...new Set(pages)].sort((a, b) => a - b);
	const items: Array<number | "gap"> = [];
	for (let index = 0; index < unique.length; index += 1) {
		if (index > 0 && unique[index] - unique[index - 1] > 1) items.push("gap");
		items.push(unique[index]);
	}
	return items;
}

export default function Courses({
	courses,
	initialQuery = "",
	data,
}: {
	courses: CourseListItem[];
	initialQuery?: string;
	data?: BlockData;
}) {
	const { t, text, flag } = useBlockContent("catalog", data);
	const showSearch = flag("showSearch");
	const showFilters = flag("showFilters");
	const eyebrow = text("eyebrow");
	const title = text("title");
	const [open, setOpen] = useState(false);
	const [videoId, setVideoId] = useState("");
	const [query, setQuery] = useState(initialQuery);
	const [activeTab, setActiveTab] = useState("all");
	const [page, setPage] = useState(1);
	const gridRef = useRef<HTMLDivElement>(null);
	const pageSize = 9;
	const tabs = [
		{ id: "all", label: t("courses.all") },
		{ id: "hsse", label: t("courses.hsse") },
		{ id: "lideranca", label: t("courses.leadership") },
		{ id: "atendimento", label: t("courses.experience") },
		{ id: "gestao", label: t("courses.business") },
		{ id: "tecnologia", label: t("courses.technology") },
	];

	const filtered = useMemo(() => {
		return courses.filter(
			(course) =>
				(activeTab === "all" || course.categorySlugs.includes(activeTab)) &&
				matchesAllTerms(query, course.searchText)
		);
	}, [activeTab, courses, query]);

	const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, pageCount);
	const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	function goTo(next: number) {
		setPage(next);
		gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	return (
		<section className="ap-catalog-list">
			<div className="container">
				{eyebrow || title ? (
					<div className="section-title mb-4">
						{eyebrow ? (
							<span>
								<BrandMark />
								{eyebrow}
							</span>
						) : null}
						{title ? <h2>{title}</h2> : null}
					</div>
				) : null}
				{showSearch || showFilters ? (
					<div className="ap-catalog-bar">
						{showSearch ? (
							<div className="ap-catalog-search">
								<form action="#" method="get" onSubmit={(event) => event.preventDefault()}>
									<i className="ph ph-magnifying-glass" aria-hidden="true"></i>
									<input
										type="search"
										placeholder={t("search.globalPlaceholder")}
										value={query}
										onChange={(event) => {
											setQuery(event.target.value);
											setPage(1);
										}}
										aria-label={t("search.button")}
									/>
								</form>
							</div>
						) : null}
						{showFilters ? (
							<div className="ap-catalog-filters" role="tablist" aria-label={t("courses.all")}>
								{tabs.map((tab) => (
									<button
										key={tab.id}
										type="button"
										role="tab"
										aria-selected={activeTab === tab.id}
										className={activeTab === tab.id ? "is-on" : ""}
										onClick={() => {
											setActiveTab(tab.id);
											setPage(1);
										}}
									>
										{tab.label}
									</button>
								))}
							</div>
						) : null}
					</div>
				) : null}

				{filtered.length === 0 ? <p className="ap-catalog-empty">{t("courses.empty")}</p> : null}
				<div className="ap-catalog-grid" ref={gridRef}>
					{visible.map((course) => (
						<CourseCard
							key={course.id}
							variant="catalog"
							course={course}
							onPlay={(id) => {
								setVideoId(id);
								setOpen(true);
							}}
						/>
					))}
				</div>
				{pageCount > 1 ? (
					<nav className="ap-catalog-pages" aria-label={t("courses.pagination")}>
						<button
							type="button"
							onClick={() => goTo(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<i className="ph ph-caret-left" aria-hidden />
							{t("courses.prevPage")}
						</button>
						{pageItems(currentPage, pageCount).map((item, index) =>
							item === "gap" ? (
								<span key={`gap-${index}`} className="ap-catalog-gap" aria-hidden>
									…
								</span>
							) : (
								<button
									key={item}
									type="button"
									className={item === currentPage ? "is-on" : ""}
									aria-current={item === currentPage ? "page" : undefined}
									aria-label={t("courses.pageLabel", { page: item })}
									onClick={() => goTo(item)}
								>
									{item}
								</button>
							)
						)}
						<button
							type="button"
							onClick={() => goTo(currentPage + 1)}
							disabled={currentPage === pageCount}
						>
							{t("courses.nextPage")}
							<i className="ph ph-caret-right" aria-hidden />
						</button>
					</nav>
				) : null}
			</div>
			<VideoPopup open={open} setOpen={setOpen} videoId={videoId} />
		</section>
	);
}

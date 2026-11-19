"use client";

import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";
import { formatPrice, getCoursePricing, pickLocale } from "@/lib/i18n-content";
import type { CourseListItem } from "@/db/queries/courses";

// Cursos com data primeiro (por ordem cronológica), depois os que ainda não têm data.
function byStartDate(a: CourseListItem, b: CourseListItem) {
	if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
	if (a.startDate) return -1;
	if (b.startDate) return 1;
	return 0;
}

export default function CalendarContent({ courses }: { courses: CourseListItem[] }) {
	const { t, locale } = useI18n();
	const dateFormatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pt-PT", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
	const formatDay = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00Z`));

	return (
		<section className="site-content section-padding">
			<div className="container">
				<div className="section-title mb-4">
					<span>{t("calendar.eyebrow")}</span>
					<h2>{t("calendar.title")}</h2>
				</div>
				<p className="site-content-lead">{t("calendar.lead")}</p>
				<div className="row gy-4">
					{[...courses].sort(byStartDate).map((course) => {
						const schedule = course.startDate
							? course.endDate && course.endDate !== course.startDate
								? `${formatDay(course.startDate)} – ${formatDay(course.endDate)}`
								: formatDay(course.startDate)
							: t("calendar.dateTbd");
						const modality =
							course.modality === "online"
								? t("courseDetails.modalityOnline")
								: t("courseDetails.modalityInPerson");
						const pricing = getCoursePricing(course);

						return (
							<div className="col-md-6 col-xl-4 d-flex" key={course.id}>
								<article className="site-card">
									<span>{schedule} · {modality}</span>
									<h3>{pickLocale(course.title, locale)}</h3>
									<p>{pickLocale(course.categoryName, locale)} · {pricing.onRequest
											? t("courses.onRequest")
											: pricing.isFree
											? t("courses.free")
											: formatPrice(pricing.price, course.currency)}</p>
									<Link href={`/courses/${course.slug}`} className="blue_btn round_btn">
										{t("calendar.cta")}
									</Link>
								</article>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

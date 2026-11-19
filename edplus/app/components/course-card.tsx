"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FreeEnrollmentModal from "@/app/components/free-enrollment-modal";
import { useI18n } from "@/app/i18n/I18nProvider";
import { useCart } from "@/app/providers/cart-provider";
import type { CourseListItem } from "@/db/queries/courses";
import { formatPrice, getCoursePricing, pickLocale } from "@/lib/i18n-content";

type CourseCardProps = {
	course: CourseListItem;
	onPlay?: (videoId: string) => void;
	className?: string;
	variant?: "default" | "catalog";
};

export default function CourseCard({
	course,
	onPlay,
	className = "course_style2",
	variant = "default",
}: CourseCardProps) {
	const { t, locale } = useI18n();
	const { addCourse } = useCart();
	const [adding, setAdding] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [enrolled, setEnrolled] = useState(false);
	const title = pickLocale(course.title, locale);
	const category = pickLocale(course.categoryName, locale);
	const excerpt = pickLocale(course.excerpt, locale);
	const pricing = getCoursePricing(course);
	const hours = course.durationMinutes ? Math.round(course.durationMinutes / 60) : 0;
	const durationLabel = hours > 0
		? t("courses.hours", { count: hours })
		: t("courses.lessons", { count: course.lessonsCount });
	const priceLabel = pricing.onRequest
		? t("courses.onRequest")
		: pricing.isFree
			? t("courses.free")
			: formatPrice(pricing.price, course.currency);
	const modalityLabel = pricing.onRequest
		? t("courses.formats")
		: course.modality === "online"
			? t("courseDetails.modalityOnline")
			: t("courseDetails.modalityInPerson");

	async function handleAdd() {
		if (pricing.isFree) {
			setConfirmOpen(true);
			return;
		}

		setAdding(true);
		await addCourse(course.id);
		setAdding(false);
	}

	const enrollLabel = pricing.isFree ? t("cart.enroll") : adding ? t("cart.adding") : t("cart.add");
	const enrollControl = enrolled ? (
		<span className="course-enrolled-badge">
			<i className="ph ph-check-circle" aria-hidden /> {t("courseDetails.enrolledBadge")}
		</span>
	) : pricing.onRequest ? (
		<Link href="/contact" className={variant === "catalog" ? "ap-catalog-enroll" : "blue_btn round_btn py-1 px-3"}>
			<span>{t("courses.onRequestCta")}</span>
			{variant === "catalog" ? <i className="ph ph-arrow-right" aria-hidden /> : null}
		</Link>
	) : variant === "catalog" ? (
		<button
			type="button"
			className="ap-catalog-enroll"
			onClick={handleAdd}
			disabled={adding}
		>
			<span>{enrollLabel}</span>
			<i className="ph ph-arrow-right" aria-hidden />
		</button>
	) : (
		<button
			type="button"
			className="blue_btn round_btn py-1 px-3"
			onClick={handleAdd}
			disabled={adding}
			style={{ fontSize: 13 }}
		>
			{enrollLabel}
		</button>
	);

	const enrollmentModal = confirmOpen ? (
		<FreeEnrollmentModal
			onClose={() => setConfirmOpen(false)}
			onEnrolled={() => setEnrolled(true)}
			course={{
				id: course.id,
				slug: course.slug,
				title,
				details: modalityLabel,
			}}
		/>
	) : null;

	if (variant === "catalog") {
		return (
			<article className="ap-catalog-card">
				<div className="ap-catalog-media">
					<Link href={`/courses/${course.slug}`}>
						<Image src={course.imageUrl} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" />
					</Link>
					{course.videoId ? (
						<button
							type="button"
							className="ap-catalog-play"
							onClick={() => onPlay?.(course.videoId!)}
						>
							<i className="ph ph-play" aria-hidden />
							<span className="visually-hidden">{t("video.play")}</span>
						</button>
					) : null}
				</div>
				<div className="ap-catalog-body">
					<span className="ap-tag">{category}</span>
					<h3>
						<Link href={`/courses/${course.slug}`}>{title}</Link>
					</h3>
					{excerpt ? <p>{excerpt}</p> : null}
					<div className="ap-pills">
						<span>{modalityLabel}</span>
						<span>{durationLabel}</span>
					</div>
					<div className="ap-catalog-foot">
						<strong>{priceLabel}</strong>
						{enrollControl}
					</div>
				</div>
				{enrollmentModal}
			</article>
		);
	}

	return (
		<div className={`single_course h-100 ${className}`}>
			<div className="course_img">
				<div className="ccategory">
					<Link href="/catalogo">
						<i className="ph ph-folder-open"></i> {category}
					</Link>
				</div>

				<Link href={`/courses/${course.slug}`}>
				<Image
					src={course.imageUrl}
					alt={title}
					width={410}
					height={300}
				/>
				</Link>

				{course.videoId ? (
					<Link
						href="#"
						className="cvbtn"
						onClick={(e) => {
							e.preventDefault();
							onPlay?.(course.videoId!);
						}}
					>
						<i className="ph ph-video-camera"></i>
					</Link>
				) : null}
			</div>

			<div className="course_content">
				<div className="crating_number">
					<i className="fa-solid fa-star"></i>
					<i className="fa-solid fa-star"></i>
					<i className="fa-solid fa-star"></i>
					<i className="fa-solid fa-star"></i>
					<i className="fa-regular fa-star"></i>
					<span>
						{t("courses.rating", {
							rating: course.ratingAvg,
							count: course.reviewsCount,
						})}
					</span>
				</div>

				<h3>
					<Link href={`/courses/${course.slug}`}>{title}</Link>
				</h3>

				<div className="cmeta d-flex gap-5">
					<div className="single_meta">
						<i className="fa-solid fa-book"></i>{" "}
						{t("courses.lessons", { count: course.lessonsCount })}
					</div>
					{course.studentsCount > 0 ? (
						<div className="single_meta">
							<i className="fa-regular fa-user"></i>{" "}
							{t("courses.students", { count: course.studentsCount })}
						</div>
					) : (
						<div className="single_meta">
							<i
								className={
									course.modality === "online"
										? "fa-solid fa-laptop"
										: "fa-solid fa-location-dot"
								}
							></i>{" "}
							{course.modality === "online"
								? t("courseDetails.modalityOnline")
								: t("courseDetails.modalityInPerson")}
						</div>
					)}
				</div>

				<div className="cbtm">
					<div className="c_price">
						{pricing.originalPrice !== null ? (
							<del>{formatPrice(pricing.originalPrice, course.currency)}</del>
						) : null}
						{priceLabel}
					</div>

					<div className="c_author">
						<div className="c_author_info">
							<Image
								src={course.authorImage}
								alt={course.author}
								width={33}
								height={33}
								className="d-inline-block"
							/>
							<span>{course.author}</span>
						</div>
						{enrolled ? (
							<span className="course-enrolled-badge">
								<i className="ph ph-check-circle" aria-hidden /> {t("courseDetails.enrolledBadge")}
							</span>
						) : pricing.onRequest ? (
							<Link href="/contact" className="blue_btn round_btn py-1 px-3" style={{ fontSize: 13 }}>
								{t("courses.onRequestCta")}
							</Link>
						) : (
							<button
								type="button"
								className="blue_btn round_btn py-1 px-3"
								onClick={handleAdd}
								disabled={adding}
								style={{ fontSize: 13 }}
							>
								{pricing.isFree
									? t("cart.enroll")
									: adding
										? t("cart.adding")
										: t("cart.add")}
							</button>
						)}
					</div>
				</div>
			</div>

			{confirmOpen ? (
				<FreeEnrollmentModal
					onClose={() => setConfirmOpen(false)}
					onEnrolled={() => setEnrolled(true)}
					course={{
						id: course.id,
						slug: course.slug,
						title,
						details:
							course.modality === "online"
								? t("courseDetails.modalityOnline")
								: t("courseDetails.modalityInPerson"),
					}}
				/>
			) : null}
		</div>
	);
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RichText from "@/app/components/rich-text";
import { PostCard } from "@/app/template-parts/news";
import type { PostListItem } from "@/db/queries/content";
import { isExternal, useBlockContent, type BlockData } from "./use-block-content";

function SectionTitle({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
	if (!eyebrow && !title) return null;
	return (
		<div className={`section-title mb-4${center ? " text-center" : ""}`}>
			{eyebrow ? <span>{eyebrow}</span> : null}
			{title ? <h2>{title}</h2> : null}
			<Image
				src="/assets/img/shapes/title.svg"
				alt=""
				width={216}
				height={20}
				className="d-inline-block"
			/>
		</div>
	);
}

export function LatestNewsBlock({ data, posts }: { data?: BlockData; posts: PostListItem[] }) {
	const { t, text } = useBlockContent("latestNews", data);
	const count = Number(text("count")) || 3;
	const items = posts.slice(0, count);
	if (!items.length) return null;

	return (
		<section className={`section-padding cms-bg-${text("background")}`}>
			<div className="container">
				<SectionTitle eyebrow={text("eyebrow")} title={text("title")} />
				<div className="row gy-4">
					{items.map((post) => (
						<div className="col-md-6 col-xl-4 d-flex" key={post.id}>
							<PostCard post={post} />
						</div>
					))}
				</div>
				<div className="mt-4">
					<Link href="/noticias" className="blue_btn round_btn">
						{t("news.viewAll")} <i className="ph ph-arrow-right" aria-hidden />
					</Link>
				</div>
			</div>
		</section>
	);
}

export function ImageTextBlock({ data }: { data?: BlockData }) {
	const { text, richText } = useBlockContent("imageText", data);
	const image = text("image");
	const buttonLabel = text("buttonLabel");
	const imageRight = text("imagePosition") === "right";

	return (
		<section className={`section-padding cms-bg-${text("background")}`}>
			<div className="container">
				<div className={`row align-items-center gy-4${imageRight ? " flex-lg-row-reverse" : ""}`}>
					{image ? (
						<div className="col-lg-6">
							<div className="cms-image-frame">
								<Image
									src={image}
									alt={text("title")}
									fill
									sizes="(max-width: 991px) 100vw, 50vw"
									unoptimized={isExternal(image)}
								/>
							</div>
						</div>
					) : null}
					<div className={image ? "col-lg-6" : "col-12"}>
						<SectionTitle eyebrow={text("eyebrow")} title={text("title")} />
						<RichText doc={richText("body")} />
						{buttonLabel ? (
							<Link href={text("buttonHref") || "/"} className="blue_btn round_btn mt-3">
								{buttonLabel} <i className="ph ph-arrow-right" aria-hidden />
							</Link>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}

export function FaqBlock({ data }: { data?: BlockData }) {
	const { text, list, itemText } = useBlockContent("faq", data);
	const [active, setActive] = useState<number | null>(0);
	const items = list("items");

	return (
		<section className={`faq section-padding cms-bg-${text("background")}`}>
			<div className="container">
				<div className="row">
					<div className="col-xl-8 mx-auto">
						<SectionTitle eyebrow={text("eyebrow")} title={text("title")} center />
						<div className="accordion">
							{items.map((item, index) => (
								<div className="accordion-item" key={index}>
									<h3 className="accordion-header">
										<button
											className={`accordion-button${active !== index ? " collapsed" : ""}`}
											type="button"
											aria-expanded={active === index}
											onClick={() => setActive(active === index ? null : index)}
										>
											{itemText(item, "question")}
										</button>
									</h3>
									<div className={`accordion-collapse${active === index ? " show" : ""}`}>
										<div className="accordion-body cms-pre-line">{itemText(item, "answer")}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export function LogosBlock({ data }: { data?: BlockData }) {
	const { text, flag, list, itemText } = useBlockContent("logos", data);
	const items = list("items").filter((item) => itemText(item, "image"));
	if (!items.length) return null;

	return (
		<section className={`section-padding cms-bg-${text("background")}`}>
			<div className="container">
				<SectionTitle eyebrow={text("eyebrow")} title={text("title")} center />
				<div className={`cms-logos${flag("grayscale") ? " is-grayscale" : ""}`}>
					{items.map((item, index) => {
						const name = itemText(item, "name");
						const href = itemText(item, "href");
						// eslint-disable-next-line @next/next/no-img-element
						const logo = <img src={itemText(item, "image")} alt={name} loading="lazy" />;
						return href ? (
							<a
								key={index}
								href={href}
								className="cms-logo"
								title={name}
								{...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
							>
								{logo}
							</a>
						) : (
							<span key={index} className="cms-logo" title={name}>
								{logo}
							</span>
						);
					})}
				</div>
			</div>
		</section>
	);
}

export function RichTextBlock({ data }: { data?: BlockData }) {
	const { text, richText } = useBlockContent("richText", data);
	const narrow = text("width") !== "wide";

	return (
		<section className={`section-padding cms-bg-${text("background")}`}>
			<div className="container">
				<div className={narrow ? "cms-narrow" : undefined}>
					<SectionTitle eyebrow={text("eyebrow")} title={text("title")} />
					<RichText doc={richText("body")} />
				</div>
			</div>
		</section>
	);
}

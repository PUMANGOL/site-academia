"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import BrandMark from "@/app/components/brand-mark";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";
import { formatPostDate } from "@/app/template-parts/news";
import type { PostListItem } from "@/db/queries/content";
import { pickLocale } from "@/lib/i18n-content";

function tagStyle(category: string) {
	const key = category.toLowerCase();
	if (key.startsWith("event")) return { background: "#10505C", color: "#FFFFFF" };
	if (key.startsWith("academ")) return { background: "#70A84C", color: "#0B3B45" };
	return { background: "#FFFFFF", color: "#10505C" };
}

export default function NewsCarousel({ data, posts }: { data?: BlockData; posts: PostListItem[] }) {
	const { t, locale, text } = useBlockContent("latestNews", data);
	const scroller = useRef<HTMLDivElement>(null);
	const paused = useRef(false);
	const [tab, setTab] = useState("all");
	const count = Number(text("count")) || 6;
	const source = posts.slice(0, count);

	const categories = useMemo(() => {
		const names = source.map((post) => pickLocale(post.category, locale)).filter(Boolean);
		return [...new Set(names)];
	}, [source, locale]);

	const filtered = useMemo(
		() =>
			tab === "all"
				? source
				: source.filter((post) => pickLocale(post.category, locale) === tab),
		[source, tab, locale]
	);
	const loop = filtered.length > 2 ? [...filtered, ...filtered] : filtered;

	useEffect(() => {
		const el = scroller.current;
		if (!el || loop.length < 3) return;
		let frame = 0;
		const tick = () => {
			if (!paused.current && el) {
				el.scrollLeft += 0.55;
				const half = el.scrollWidth / 2;
				if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [loop.length, tab]);

	function scrollByDir(dir: number) {
		const el = scroller.current;
		if (!el) return;
		paused.current = true;
		el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
		window.setTimeout(() => {
			paused.current = false;
		}, 1800);
	}

	if (!source.length) return null;

	return (
		<section id="noticias" className="ap-news">
			<div className="container">
				<div className="ap-news-head">
					<div>
						<div className="section-title mb-0">
							<span>
								<BrandMark />
								{text("eyebrow")}
							</span>
							<h2>
								{text("title")} <span className="ap-hl">{text("titleHighlight")}</span>
							</h2>
						</div>
						<Link href="/noticias" className="ap-text-link mt-3 d-inline-flex">
							{t("news.viewAll")}
							<i className="ph ph-arrow-right" aria-hidden />
						</Link>
					</div>
					<div className="ap-news-controls">
						{["all", ...categories].map((name) => {
							const label = name === "all" ? t("news.all") : name;
							const on = tab === name;
							return (
								<button
									key={name}
									type="button"
									className={`ap-chip-btn${on ? " is-on" : ""}`}
									onClick={() => {
										setTab(name);
										if (scroller.current) scroller.current.scrollLeft = 0;
									}}
								>
									{label}
								</button>
							);
						})}
						<button
							type="button"
							className="ap-nav-btn"
							aria-label={t("news.prev")}
							onClick={() => scrollByDir(-1)}
						>
							<i className="ph ph-arrow-left" aria-hidden />
						</button>
						<button
							type="button"
							className="ap-nav-btn is-fill"
							aria-label={t("news.next")}
							onClick={() => scrollByDir(1)}
						>
							<i className="ph ph-arrow-right" aria-hidden />
						</button>
					</div>
				</div>
			</div>
			<div className="container">
				<div
					ref={scroller}
					className="ap-scroller auto"
					onMouseEnter={() => {
						paused.current = true;
					}}
					onMouseLeave={() => {
						paused.current = false;
					}}
					onTouchStart={() => {
						paused.current = true;
					}}
					onTouchEnd={() => {
						paused.current = false;
					}}
				>
					{loop.map((post, index) => {
						const title = pickLocale(post.title, locale);
						const category = pickLocale(post.category, locale);
						return (
							<Link
								href={`/noticias/${post.slug}`}
								className="ap-news-card lift"
								key={`${post.id}-${index}`}
							>
								<span className="ap-news-cover zoom">
									{post.coverImageUrl ? (
										<Image
											src={post.coverImageUrl}
											alt={title}
											fill
											sizes="400px"
										/>
									) : null}
									{category ? (
										<span className="ap-news-tag" style={tagStyle(category)}>
											{category}
										</span>
									) : null}
								</span>
								<span className="ap-news-body">
									<span className="ap-news-meta">
										{t("news.source")} · {formatPostDate(post.publishedAt, locale)}
									</span>
									<span className="disp">{title}</span>
									<span className="ap-news-excerpt">{pickLocale(post.excerpt, locale)}</span>
									<span className="ap-news-more">
										{t("news.readMore")}
										<i className="ph ph-arrow-right" aria-hidden />
									</span>
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { PostListItem } from "@/db/queries/content";
import { pickLocale } from "@/lib/i18n-content";

export function formatPostDate(iso: string, locale: string) {
	return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pt-PT", {
		dateStyle: "long",
	}).format(new Date(iso));
}

export function PostCard({ post, featured = false }: { post: PostListItem; featured?: boolean }) {
	const { t, locale } = useI18n();
	const title = pickLocale(post.title, locale);
	const href = `/noticias/${post.slug}`;

	return (
		<article className={`site-card post-card${featured ? " is-featured" : ""}`}>
			{post.coverImageUrl ? (
				<Link href={href} className="post-card-cover">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={post.coverImageUrl} alt={title} loading="lazy" />
				</Link>
			) : null}
			<div className="post-card-body">
				<span>
					{pickLocale(post.category, locale) || t("news.category")} ·{" "}
					{formatPostDate(post.publishedAt, locale)}
				</span>
				<h3>
					<Link href={href}>{title}</Link>
				</h3>
				<p>{pickLocale(post.excerpt, locale)}</p>
				<Link href={href} className="post-card-link">
					{t("news.readMore")} <i className="ph ph-arrow-right" aria-hidden />
				</Link>
			</div>
		</article>
	);
}

// Bloco "Lista de notícias" (página /noticias). Sem `data`, usa os valores por omissão.
export default function NewsList({ posts, data }: { posts: PostListItem[]; data?: BlockData }) {
	const { t, locale, text, flag } = useBlockContent("newsList", data);
	const pageSize = Number(text("pageSize")) || 9;
	const [category, setCategory] = useState("");
	const [visible, setVisible] = useState(pageSize);

	// Categorias pela ordem em que aparecem nas notícias (a mais recente primeiro).
	const categories = useMemo(() => {
		const names = posts.map((post) => pickLocale(post.category, locale)).filter(Boolean);
		return [...new Set(names)];
	}, [posts, locale]);

	const filtered = category
		? posts.filter((post) => pickLocale(post.category, locale) === category)
		: posts;
	const shown = filtered.slice(0, visible);
	const featureFirst = flag("featureFirst") && !category && shown.length > 1;

	return (
		<section className="site-content section-padding">
			<div className="container">
				<div className="news-list-head">
					<div className="section-title mb-0">
						<span>{text("eyebrow")}</span>
						<h2>{text("title")}</h2>
					</div>
					{flag("showFilters") && categories.length > 1 ? (
						<nav className="course_nav news-filters" aria-label={t("news.filter")}>
							<ul>
								{["", ...categories].map((name) => (
									<li
										key={name || "all"}
										className={category === name ? "active" : ""}
										onClick={() => {
											setCategory(name);
											setVisible(pageSize);
										}}
									>
										{name || t("news.all")}
									</li>
								))}
							</ul>
						</nav>
					) : null}
				</div>

				<div className="row gy-4">
					{shown.map((post, index) => {
						const featured = featureFirst && index === 0;
						return (
							<div
								className={featured ? "col-12 d-flex" : "col-md-6 col-xl-4 d-flex"}
								key={post.id}
							>
								<PostCard post={post} featured={featured} />
							</div>
						);
					})}
				</div>

				{filtered.length > visible ? (
					<div className="news-list-foot">
						<button
							type="button"
							className="blue_btn round_btn"
							onClick={() => setVisible((value) => value + pageSize)}
						>
							{t("news.loadMore")} ({filtered.length - visible})
						</button>
					</div>
				) : null}
			</div>
		</section>
	);
}

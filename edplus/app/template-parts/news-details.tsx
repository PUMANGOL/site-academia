"use client";

import Link from "next/link";
import RichText, { isRichTextEmpty } from "@/app/components/rich-text";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { PostDetail } from "@/db/queries/content";
import { pickLocale } from "@/lib/i18n-content";
import { formatPostDate } from "./news";

export default function NewsDetails({ post }: { post: PostDetail }) {
	const { t, locale } = useI18n();
	const title = pickLocale(post.title, locale);
	const localized = post.body[locale];
	const body = isRichTextEmpty(localized) ? post.body.pt : localized;
	const category = pickLocale(post.category, locale);

	return (
		<section className="site-content section-padding">
			<div className="container">
				<article className="post-detail">
					<p className="post-detail-meta">
						{category ? `${category} · ` : ""}
						{formatPostDate(post.publishedAt, locale)}
					</p>
					<h1 className="post-detail-title">{title}</h1>
					{post.coverImageUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={post.coverImageUrl} alt={title} className="post-detail-cover" />
					) : null}
					<RichText doc={body} />
					<div className="mt-5">
						<Link href="/noticias" className="blue_btn round_btn btn-brand-dark">
							<i className="ph ph-arrow-left" aria-hidden />
							<span>{t("news.back")}</span>
						</Link>
					</div>
				</article>
			</div>
		</section>
	);
}

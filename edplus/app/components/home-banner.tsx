"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { brandImages } from "@/app/data/brand-images";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";

type Slide = {
	img: string;
	pos: string;
	title: string;
	text: string;
	label: string;
};

export default function HomeBanner({ data }: { data?: BlockData }) {
	const { t, text } = useBlockContent("hero", data);
	const [slide, setSlide] = useState(0);
	const [typed, setTyped] = useState(0);
	const title = text("title");
	const highlight = text("highlight");
	const body = text("text");
	const buttonLabel = text("buttonLabel");
	const buttonHref = text("buttonHref");

	const slides: Slide[] = useMemo(() => {
		const firstTitle = [title, highlight].filter(Boolean).join(". ");
		return [
			{
				img: brandImages.heroIso,
				pos: "center 40%",
				title: firstTitle || t("hero.slide1Title"),
				text: body || t("hero.slide1Text"),
				label: t("hero.slide1Label"),
			},
			{
				img: brandImages.heroFormacao4,
				pos: "center 35%",
				title: t("hero.slide2Title"),
				text: t("hero.slide2Text"),
				label: t("hero.slide2Label"),
			},
			{
				img: brandImages.heroFormacao,
				pos: "center 42%",
				title: t("hero.slide3Title"),
				text: t("hero.slide3Text"),
				label: t("hero.slide3Label"),
			},
		];
	}, [body, highlight, t, title]);

	const current = slides[slide];
	const typedTitle = current.title.slice(0, typed);
	const typing = typed < current.title.length;

	useEffect(() => {
		setTyped(0);
		const length = slides[slide]?.title.length ?? 0;
		const reduce =
			typeof matchMedia !== "undefined" &&
			matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) {
			setTyped(length);
			return;
		}
		const typeTimer = window.setInterval(() => {
			setTyped((n) => {
				if (n >= length) {
					window.clearInterval(typeTimer);
					return n;
				}
				return n + 1;
			});
		}, 34);
		return () => window.clearInterval(typeTimer);
	}, [slide, slides]);

	useEffect(() => {
		const reduce =
			typeof matchMedia !== "undefined" &&
			matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) return;
		const timer = window.setInterval(() => {
			setSlide((n) => (n + 1) % 3);
		}, 7000);
		return () => window.clearInterval(timer);
	}, []);

	const ctaLabel = buttonLabel || t("hero.ctaQuote");
	const ctaHref = buttonHref || "/#contacto";

	return (
		<section className="ap-hero">
			<div className="ap-hero-media">
				{slides.map((item, index) => (
					<div
						key={item.label}
						className={`ap-hero-slide${index === slide ? " is-on" : ""}`}
					>
						<Image
							src={item.img}
							alt=""
							fill
							priority={index === 0}
							sizes="100vw"
							className="ap-kb"
							style={{ objectFit: "cover", objectPosition: item.pos }}
						/>
					</div>
				))}
				<div className="ap-hero-veil" />
			</div>

			<div className="container ap-hero-inner">
				<div style={{ maxWidth: 720 }}>
					<h1 className="ap-up2">
						{typedTitle}
						<span className="ap-caret" style={{ opacity: typing ? 1 : 0 }} />
					</h1>
					<p
						className="lead ap-up3 mb-0"
						style={{
							opacity: typing ? 0 : 1,
							transform: typing ? "translateY(14px)" : "none",
							transition: "opacity .7s ease, transform .7s ease",
						}}
					>
						{current.text}
					</p>
					<div className="d-flex flex-wrap gap-3 align-items-center mt-4 pt-2 ap-up4">
						<Link href={ctaHref} className="blue_btn round_btn">
							{ctaLabel}
							<i className="ph ph-arrow-right" />
						</Link>
					</div>
				</div>

				<div className="ap-hero-steps">
						{slides.map((item, index) => (
							<button
								key={item.label}
								type="button"
								className={`ap-hero-pick${index === slide ? " is-on" : ""}`}
								onClick={() => setSlide(index)}
							>
								<div className={`ap-slidebar${index === slide ? " is-on" : ""}`}>
									<span key={index === slide ? slide : "idle"} />
								</div>
								<div className="idx">0{index + 1}</div>
								<div className="lbl">{item.label}</div>
							</button>
						))}
				</div>
			</div>
		</section>
	);
}

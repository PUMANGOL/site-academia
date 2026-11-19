"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BrandMark from "@/app/components/brand-mark";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";

function formatPt(n: number) {
	return Math.round(n)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function useCountUp(target: number, active: boolean) {
	const [value, setValue] = useState(0);
	useEffect(() => {
		if (!active) return;
		const reduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduced) {
			setValue(target);
			return;
		}
		const start = performance.now();
		const duration = 1400;
		let frame = 0;
		const tick = (now: number) => {
			const p = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - p, 3);
			setValue(target * eased);
			if (p < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [active, target]);
	return value;
}

export default function IntroStats({ data }: { data?: BlockData }) {
	const { text, list, itemText } = useBlockContent("introStats", data);
	const statsRef = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);
	const stats = list("stats");

	useEffect(() => {
		const el = statsRef.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setInView(true);
					io.disconnect();
				}
			},
			{ threshold: 0.35 }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<section id="intro" className="ap-intro ap-stack">
			<div className="container">
				<div className="ap-intro-top sec-in">
					<div className="ap-intro-copy">
						<div className="section-title mb-0">
							<span>
								<BrandMark />
								{text("eyebrow")}
							</span>
							<h2>
								{text("title")} <span className="ap-hl">{text("highlight")}</span>
							</h2>
						</div>
						<p>{text("text")}</p>
						<div className="ap-partner">
							<span>{text("partnerLabel")}</span>
							<Image
								src="/assets/img/about/nova-logo-exec-education.png"
								alt={text("partnerName")}
								width={625}
								height={110}
								className="ap-partner-logo"
							/>
						</div>
					</div>
					<div ref={statsRef} className="ap-stats">
						{stats.map((item, index) => (
							<StatRow
								key={index}
								target={Number(itemText(item, "value")) || 0}
								suffix={itemText(item, "suffix")}
								label={itemText(item, "label")}
								active={inView}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function StatRow({
	target,
	suffix,
	label,
	active,
}: {
	target: number;
	suffix: string;
	label: string;
	active: boolean;
}) {
	const value = useCountUp(target, active);
	return (
		<div className="ap-stat">
			<span className="disp">
				{formatPt(value)}
				<span className="ap-hl">{suffix}</span>
			</span>
			<span>{label}</span>
		</div>
	);
}

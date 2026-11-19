"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function FooterArches() {
	const { t } = useI18n();
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof IntersectionObserver === "undefined") {
			setInView(true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setInView(true);
					io.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<div ref={ref} className={`ap-arches${inView ? " is-in" : ""}`}>
			<div className="ap-arches-row">
				<ArchesTile />
			</div>
			<div className="ap-arches-tag disp d-none d-md-block position-absolute start-0 end-0">
				<div className="container ap-arches-tagline">
					{t("hero.tagline")}
				</div>
			</div>
		</div>
	);
}

function ArchesTile() {
	return (
		<div className="ap-arches-tile">
			<svg
				className="ap-arches-shapes"
				viewBox="-80 120 1730 260"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<g style={{ animationDelay: "3s" }}>
					<path d="M1350,380 A150,239 0 0 1 1500,141 L1500,149 A102,231 0 0 0 1398,380 Z" fill="#1A5F6C" />
					<path d="M1500,141 A150,239 0 0 1 1650,380 L1602,380 A102,231 0 0 0 1500,149 Z" fill="#70A84C" />
				</g>
				<g style={{ animationDelay: "2.5s" }}>
					<path d="M1115,380 A150,215 0 0 1 1265,165 L1265,173 A102,207 0 0 0 1163,380 Z" fill="#1A5F6C" />
					<path d="M1265,165 A150,215 0 0 1 1415,380 L1367,380 A102,207 0 0 0 1265,173 Z" fill="#70A84C" />
				</g>
				<g style={{ animationDelay: "2s" }}>
					<path d="M880,380 A150,190 0 0 1 1030,190 L1030,198 A102,182 0 0 0 928,380 Z" fill="#1A5F6C" />
					<path d="M1030,190 A150,190 0 0 1 1180,380 L1132,380 A102,182 0 0 0 1030,198 Z" fill="#70A84C" />
				</g>
				<g style={{ animationDelay: "1.5s" }}>
					<path d="M645,380 A150,165 0 0 1 795,215 L795,223 A102,157 0 0 0 693,380 Z" fill="#1A5F6C" />
					<path d="M795,215 A150,165 0 0 1 945,380 L897,380 A102,157 0 0 0 795,223 Z" fill="#70A84C" />
				</g>
				<g style={{ animationDelay: "1s" }}>
					<path d="M410,380 A150,140 0 0 1 560,240 L560,248 A102,132 0 0 0 458,380 Z" fill="#1A5F6C" />
					<path d="M560,240 A150,140 0 0 1 710,380 L662,380 A102,132 0 0 0 560,248 Z" fill="#70A84C" />
				</g>
				<g style={{ animationDelay: "0.5s" }}>
					<path d="M175,380 A150,115 0 0 1 325,265 L325,273 A102,107 0 0 0 223,380 Z" fill="#1A5F6C" />
					<path d="M325,265 A150,115 0 0 1 475,380 L427,380 A102,107 0 0 0 325,273 Z" fill="#70A84C" />
				</g>
				<g style={{ animationDelay: "0s" }}>
					<path d="M-60,380 A150,90 0 0 1 90,290 L90,298 A102,82 0 0 0 -12,380 Z" fill="#1A5F6C" />
					<path d="M90,290 A150,90 0 0 1 240,380 L192,380 A102,82 0 0 0 90,298 Z" fill="#70A84C" />
				</g>
			</svg>
			<svg viewBox="-80 120 1730 260" preserveAspectRatio="none" aria-hidden="true">
				<path
					d="M-40,380 A100,55 0 0 1 160,380 A100,78 0 0 1 360,380 A100,101 0 0 1 560,380 A100,124 0 0 1 760,380 A100,147 0 0 1 960,380 A100,170 0 0 1 1160,380 A100,193 0 0 1 1360,380 A100,216 0 0 1 1560,380"
					fill="none"
					stroke="#FFFFFF"
					strokeOpacity="0.1"
					strokeWidth="2"
				/>
				<path
					className="ap-travel"
					d="M-40,380 A100,55 0 0 1 160,380 A100,78 0 0 1 360,380 A100,101 0 0 1 560,380 A100,124 0 0 1 760,380 A100,147 0 0 1 960,380 A100,170 0 0 1 1160,380 A100,193 0 0 1 1360,380 A100,216 0 0 1 1560,380"
					pathLength="1"
					fill="none"
					stroke="#9BD774"
					strokeWidth="3.5"
					strokeLinecap="round"
				/>
				<path
					className="ap-travel t2"
					d="M-40,380 A100,55 0 0 1 160,380 A100,78 0 0 1 360,380 A100,101 0 0 1 560,380 A100,124 0 0 1 760,380 A100,147 0 0 1 960,380 A100,170 0 0 1 1160,380 A100,193 0 0 1 1360,380 A100,216 0 0 1 1560,380"
					pathLength="1"
					fill="none"
					stroke="#9BD774"
					strokeWidth="3.5"
					strokeLinecap="round"
				/>
			</svg>
		</div>
	);
}

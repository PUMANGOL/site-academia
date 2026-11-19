"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
	const [visible, setVisible] = useState(true);
	const [leaving, setLeaving] = useState(false);

	useEffect(() => {
		const hide = setTimeout(() => setLeaving(true), 1600);
		return () => clearTimeout(hide);
	}, []);

	useEffect(() => {
		if (!leaving) return;
		const gone = setTimeout(() => setVisible(false), 420);
		return () => clearTimeout(gone);
	}, [leaving]);

	if (!visible) return null;

	return (
		<div
			className={`preloader_wrap ap-loader${leaving ? " is-out" : ""}`}
			role="status"
			aria-live="polite"
			aria-label="A carregar"
		>
			<div className="ap-loader-mark" aria-hidden="true">
				<svg viewBox="0 0 640 460">
					<g className="ap-loader-arc" style={{ animationDelay: "0.28s, 1.18s" }}>
						<path d="M370,460 A135,440 0 0 1 505,20 L505,34 A89,426 0 0 0 416,460 Z" fill="#1A5F6C" />
						<path d="M505,20 A135,440 0 0 1 640,460 L594,460 A89,426 0 0 0 505,34 Z" fill="#70A84C" />
					</g>
					<g className="ap-loader-arc" style={{ animationDelay: "0.14s, 1.04s" }}>
						<path d="M170,460 A130,320 0 0 1 300,140 L300,154 A86,306 0 0 0 214,460 Z" fill="#1A5F6C" />
						<path d="M300,140 A130,320 0 0 1 430,460 L386,460 A86,306 0 0 0 300,154 Z" fill="#70A84C" />
					</g>
					<g className="ap-loader-arc" style={{ animationDelay: "0s, 0.9s" }}>
						<path d="M0,460 A115,210 0 0 1 115,250 L115,264 A71,196 0 0 0 44,460 Z" fill="#1A5F6C" />
						<path d="M115,250 A115,210 0 0 1 230,460 L186,460 A71,196 0 0 0 115,264 Z" fill="#70A84C" />
					</g>
				</svg>
			</div>
		</div>
	);
}

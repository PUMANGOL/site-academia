"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAuthPath } from "@/lib/auth-paths";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScrollY() {
	return (
		window.pageYOffset ||
		document.documentElement.scrollTop ||
		document.body.scrollTop ||
		0
	);
}

function getScrollProgress() {
	const scrollingElement =
		document.scrollingElement || document.documentElement;
	const totalHeight = Math.max(
		scrollingElement.scrollHeight - window.innerHeight,
		1
	);
	return Math.min((getScrollY() / totalHeight) * 100, 100);
}

export default function ScrollToTop() {
	const pathname = usePathname();
	const [scroll, setScroll] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			setScroll(getScrollProgress());
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		document.addEventListener("scroll", handleScroll, { passive: true });
		document.body.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
			document.removeEventListener("scroll", handleScroll);
			document.body.removeEventListener("scroll", handleScroll);
		};
	}, []);

	if (pathname?.startsWith("/backoffice") || isAuthPath(pathname)) return null;

	const strokeDashoffset = CIRCUMFERENCE - (scroll / 100) * CIRCUMFERENCE;

	return (
		<button
			type="button"
			aria-label="Voltar ao topo"
			className="progress-wrap active-progress"
			onClick={() => {
				window.scrollTo({ top: 0, behavior: "smooth" });
				document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
				document.body.scrollTo({ top: 0, behavior: "smooth" });
			}}
		>
			<svg
				className="progress-circle svg-content"
				viewBox="0 0 100 100"
				aria-hidden="true"
			>
				<circle className="progress-bg" cx="50" cy="50" r={RADIUS} />
				<circle
					className="progress-bar"
					cx="50"
					cy="50"
					r={RADIUS}
					style={{
						strokeDasharray: CIRCUMFERENCE,
						strokeDashoffset,
					}}
				/>
			</svg>
			<i className="ph ph-arrow-up"></i>
		</button>
	);
}

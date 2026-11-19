"use client";

import { useEffect } from "react";

export function usePublicSite(overlay = false) {
	useEffect(() => {
		document.body.classList.add("site-public");
		document.body.classList.toggle("overlay-header", overlay);
		return () => {
			document.body.classList.remove("site-public", "overlay-header");
		};
	}, [overlay]);
}

export function useHeaderOffset(id = "navigation") {
	useEffect(() => {
		const header = document.getElementById(id);
		if (!header) return;

		const apply = () => {
			document.documentElement.style.setProperty(
				"--header-height",
				`${header.offsetHeight}px`
			);
		};

		apply();
		const observer = new ResizeObserver(apply);
		observer.observe(header);
		window.addEventListener("resize", apply);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", apply);
		};
	}, [id]);
}

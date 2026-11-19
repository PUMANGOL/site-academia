"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isAuthPath } from "@/lib/auth-paths";

const MAX_LENGTH = 40;
const BEND = 12;

export default function CursorLine() {
	const pathname = usePathname();
	const rootRef = useRef<SVGSVGElement>(null);
	const pathRef = useRef<SVGPathElement>(null);
	const fadeRef = useRef<SVGLinearGradientElement>(null);
	const tipRef = useRef<SVGCircleElement>(null);
	const haloRef = useRef<SVGCircleElement>(null);
	const hidden =
		!pathname || pathname.startsWith("/backoffice") || isAuthPath(pathname);

	useEffect(() => {
		if (hidden) return;
		const root = rootRef.current;
		const path = pathRef.current;
		const fade = fadeRef.current;
		const tip = tipRef.current;
		const halo = haloRef.current;
		if (!root || !path || !fade || !tip || !halo) return;
		if (window.matchMedia("(pointer: coarse)").matches) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let mouseX = 0;
		let mouseY = 0;
		let tailX = 0;
		let tailY = 0;
		let placed = false;
		let frame = 0;
		let idle = 0;

		const placeTip = (x: number, y: number) => {
			tip.setAttribute("cx", String(x));
			tip.setAttribute("cy", String(y));
			halo.setAttribute("cx", String(x));
			halo.setAttribute("cy", String(y));
		};

		const tick = () => {
			frame = window.requestAnimationFrame(tick);
			if (!placed) return;

			tailX += (mouseX - tailX) * 0.18;
			tailY += (mouseY - tailY) * 0.18;

			let dx = mouseX - tailX;
			let dy = mouseY - tailY;
			let distance = Math.hypot(dx, dy);
			if (distance > MAX_LENGTH) {
				tailX = mouseX - (dx / distance) * MAX_LENGTH;
				tailY = mouseY - (dy / distance) * MAX_LENGTH;
				dx = mouseX - tailX;
				dy = mouseY - tailY;
				distance = MAX_LENGTH;
			}

			placeTip(mouseX, mouseY);

			if (distance < 6) {
				path.setAttribute("d", "");
				return;
			}

			const controlX = (tailX + mouseX) / 2 - (dy / distance) * BEND;
			const controlY = (tailY + mouseY) / 2 + (dx / distance) * BEND;
			path.setAttribute(
				"d",
				`M ${tailX} ${tailY} Q ${controlX} ${controlY} ${mouseX} ${mouseY}`
			);
			fade.setAttribute("x1", String(tailX));
			fade.setAttribute("y1", String(tailY));
			fade.setAttribute("x2", String(mouseX));
			fade.setAttribute("y2", String(mouseY));
		};

		const hide = () => {
			root.classList.remove("is-moving");
			placed = false;
			path.setAttribute("d", "");
		};

		const onMove = (event: MouseEvent) => {
			mouseX = event.clientX;
			mouseY = event.clientY;
			if (!placed) {
				tailX = mouseX;
				tailY = mouseY;
				placed = true;
			}
			root.classList.add("is-moving");
			window.clearTimeout(idle);
			idle = window.setTimeout(hide, 280);
		};

		window.addEventListener("mousemove", onMove);
		document.documentElement.addEventListener("mouseleave", hide);
		frame = window.requestAnimationFrame(tick);

		return () => {
			window.cancelAnimationFrame(frame);
			window.clearTimeout(idle);
			window.removeEventListener("mousemove", onMove);
			document.documentElement.removeEventListener("mouseleave", hide);
		};
	}, [hidden]);

	if (hidden) return null;

	return (
		<svg ref={rootRef} className="ap-cursor-line" aria-hidden="true">
			<defs>
				<linearGradient ref={fadeRef} id="ap-cursor-stroke" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#70A84C" stopOpacity="0" />
					<stop offset="1" stopColor="#70A84C" stopOpacity="1" />
				</linearGradient>
			</defs>
			<path ref={pathRef} />
			<circle ref={haloRef} className="ap-cursor-halo" r="11" cx="-40" cy="-40" />
			<circle ref={tipRef} className="ap-cursor-tip" r="4.5" cx="-40" cy="-40" />
		</svg>
	);
}

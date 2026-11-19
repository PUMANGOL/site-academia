"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VIDEO_ID = "Z8PMsGDGL5U";

function isAboutLink(target: EventTarget | null) {
	const link = target instanceof Element ? target.closest("a") : null;
	if (!link) return false;
	const href = link.getAttribute("href");
	if (!href || href.startsWith("#")) return false;
	try {
		const path = new URL(href, window.location.origin).pathname.replace(/\/$/, "") || "/";
		return path === "/about";
	} catch {
		return false;
	}
}

type Player = {
	playVideo: () => void;
	pauseVideo: () => void;
	unMute: () => void;
	mute: () => void;
	setVolume: (volume: number) => void;
	isMuted: () => boolean;
	getVolume: () => number;
};

let wantSound = false;

function withSound(player: Player | null) {
	wantSound = true;
	if (!player) return;
	try {
		player.setVolume(100);
		player.unMute();
		player.playVideo();
	} catch {
		// O leitor ainda não aceita comandos. O pedido fica para quando estiver pronto.
	}
}

declare global {
	interface Window {
		YT?: {
			Player: new (element: HTMLElement, options: Record<string, unknown>) => Player;
		};
		onYouTubeIframeAPIReady?: () => void;
	}
}

export default function AboutVideoEngine() {
	const pathname = usePathname();
	const shellRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<Player | null>(null);

	useEffect(() => {
		const shell = shellRef.current;
		if (!shell) return;
		const mount = document.createElement("div");
		shell.appendChild(mount);
		let cancelled = false;

		const create = () => {
			if (cancelled || playerRef.current || !mount.isConnected) return;
			playerRef.current = new window.YT!.Player(mount, {
				videoId: VIDEO_ID,
				playerVars: {
					autoplay: 0,
					controls: 1,
					rel: 0,
					modestbranding: 1,
					playsinline: 1,
					iv_load_policy: 3,
					origin: window.location.origin,
				},
				events: {
					onReady: (event: { target: Player }) => {
						playerRef.current = event.target;
						event.target.setVolume(100);
						event.target.unMute();
						if (wantSound || window.location.pathname === "/about") event.target.playVideo();
					},
				},
			});
		};

		if (window.YT?.Player) create();
		else {
			const previous = window.onYouTubeIframeAPIReady;
			window.onYouTubeIframeAPIReady = () => {
				previous?.();
				create();
			};
		}

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			if (!isAboutLink(event.target)) return;
			withSound(playerRef.current);
		};
		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, []);

	useEffect(() => {
		const shell = shellRef.current;
		if (!shell) return;
		if (pathname !== "/about") {
			shell.classList.remove("is-active");
			shell.style.top = "";
			shell.style.left = "";
			shell.style.width = "";
			shell.style.height = "";
			try {
				playerRef.current?.pauseVideo();
			} catch {
				// O leitor ainda não está pronto.
			}
			return;
		}

		let frameId = 0;
		const place = () => {
			const slot = document.querySelector(".ap-yt-slot");
			if (!slot) return;
			const rect = slot.getBoundingClientRect();
			shell.style.top = `${rect.top}px`;
			shell.style.left = `${rect.left}px`;
			shell.style.width = `${rect.width}px`;
			shell.style.height = `${rect.height}px`;
		};
		const track = () => {
			place();
			frameId = window.requestAnimationFrame(track);
		};
		frameId = window.requestAnimationFrame(track);
		withSound(playerRef.current);
		return () => window.cancelAnimationFrame(frameId);
	}, [pathname]);

	return <div ref={shellRef} className={`ap-yt-engine${pathname === "/about" ? " is-active" : ""}`} />;
}

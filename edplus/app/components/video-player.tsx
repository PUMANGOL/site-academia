"use client";

import { useState } from "react";
import { useI18n } from "@/app/i18n/I18nProvider";

export const YOUTUBE_ID = "Z8PMsGDGL5U";

export default function VideoPlayer({
	videoId = YOUTUBE_ID,
	intro,
	intro2,
	autoplay = false,
}: {
	videoId?: string;
	intro?: string;
	intro2?: string;
	autoplay?: boolean;
}) {
	const [playing, setPlaying] = useState(false);
	const { t } = useI18n();
	const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
	const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

	return (
		<div
			className={`video_area${playing || autoplay ? " is-playing" : ""}`}
			style={
				autoplay
					? undefined
					: {
							backgroundImage: `url(${thumbnail})`,
						}
			}
		>
			{autoplay ? <div className="ap-yt-slot" /> : null}
			{playing && !autoplay ? (
				<iframe
					className="video_area-embed"
					src={embedSrc}
					title="Academia Pumangol"
					allow="autoplay; encrypted-media"
					allowFullScreen
				/>
			) : null}

			{autoplay ? null : (
				<div className="row g-3 g-md-4 wow fadeInUp">
					<div className="col-lg-6 col-md-7 align-self-center text-center video_area-title">
						<h2>
							{intro ?? t("video.intro")} <br />
							{intro2 ?? t("video.intro2")}
						</h2>
					</div>

					<div className="col-lg-6 col-md-5 align-self-center text-center">
						<button
							type="button"
							className="vplay_btn"
							aria-label={t("video.play")}
							onClick={() => setPlaying(true)}
						>
							<i className="ph ph-play"></i>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

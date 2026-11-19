"use client";
import Image from "next/image";
import { useBlockContent, type BlockData } from "@/app/components/page-blocks/use-block-content";
import { youtubeId } from "@/lib/page-blocks";
import VideoPlayer from "./video-player";

export default function WorkingArea({
	className = "",
	data,
	flush = false,
}: {
	className?: string;
	data?: BlockData;
	flush?: boolean;
}) {
	const { text } = useBlockContent("video", data);
	const player = (
		<VideoPlayer
			videoId={youtubeId(text("youtube")) ?? undefined}
			intro={text("intro")}
			intro2={text("intro2")}
			autoplay={flush}
		/>
	);

	if (flush) {
		return <section className={`working-area ap-video-flush ${className}`.trim()}>{player}</section>;
	}

	return (
		<section className={`working-area section-padding ${className}`.trim()}>
			<div className="container">
				<div className="section-title text-center wow fadeInUp">
					<span>{text("eyebrow")}</span>

					<h2>{text("title")}</h2>

					<Image
						src="/assets/img/shapes/title.svg"
						alt=""
						width={216}
						height={19}
						className="d-inline-block"
					/>
				</div>

				{player}
			</div>
		</section>
	);
}

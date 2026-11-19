import Image from "next/image";
import { brandImages } from "@/app/data/brand-images";

export default function SiteLogo({
	width = 220,
	height = 65,
	priority = false,
	className,
	inverted = false,
}: {
	width?: number;
	height?: number;
	priority?: boolean;
	className?: string;
	inverted?: boolean;
}) {
	const shared = { alt: "Academia Pumangol", width, height, priority };

	if (inverted) {
		return (
			<Image
				{...shared}
				src={brandImages.logoWhite}
				className={className}
			/>
		);
	}

	return (
		<>
			<Image
				{...shared}
				src={brandImages.logoColor}
				className={["logo-light", className].filter(Boolean).join(" ")}
			/>
			<Image
				{...shared}
				src={brandImages.logoWhite}
				className={["logo-dark", className].filter(Boolean).join(" ")}
			/>
		</>
	);
}

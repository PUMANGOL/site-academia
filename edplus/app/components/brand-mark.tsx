import { brandImages } from "@/app/data/brand-images";

// Símbolo oficial (os dois arcos), 505×321, apresentado a 16px de altura.
export default function BrandMark({
	variant = "light",
	className = "",
}: {
	variant?: "light" | "dark";
	className?: string;
}) {
	return (
		<svg
			width="25"
			height="16"
			viewBox="0 0 505 321"
			aria-hidden="true"
			className={className}
		>
			{variant === "dark" ? (
				<image href={brandImages.symbolWhite} width="505" height="321" />
			) : (
				<>
					<image
						href={brandImages.symbolColor}
						width="505"
						height="321"
						className="logo-light"
					/>
					<image
						href={brandImages.symbolWhite}
						width="505"
						height="321"
						className="logo-dark"
					/>
				</>
			)}
		</svg>
	);
}

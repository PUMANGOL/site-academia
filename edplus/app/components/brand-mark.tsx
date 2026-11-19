export default function BrandMark({
	variant = "light",
	className = "",
}: {
	variant?: "light" | "dark";
	className?: string;
}) {
	const left = variant === "dark" ? "#FFFFFF" : "#10505C";
	return (
		<svg
			width="22"
			height="20"
			viewBox="0 0 24 22"
			aria-hidden="true"
			className={className}
		>
			<path d="M1,22 A11,20 0 0 1 12,2 L12,4 A5.5,18 0 0 0 6.5,22 Z" fill={left} />
			<path d="M12,2 A11,20 0 0 1 23,22 L17.5,22 A5.5,18 0 0 0 12,4 Z" fill="#70A84C" />
		</svg>
	);
}

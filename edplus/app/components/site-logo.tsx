import Image from "next/image";
import { brandImages } from "@/app/data/brand-images";

// Proporções reais da arte oficial: versão compacta (sem assinatura) e
// versão completa (com a assinatura "Cria futuro.").
const COMPACT_RATIO = 1149 / 322;
const SIGNATURE_RATIO = 1149 / 428;

export default function SiteLogo({
	height = 44,
	signature = false,
	inverted = false,
	priority = false,
	className,
}: {
	height?: number;
	signature?: boolean;
	inverted?: boolean;
	priority?: boolean;
	className?: string;
}) {
	// A largura deriva sempre da altura, para o logótipo nunca ser deformado.
	const shared = {
		width: Math.round(height * (signature ? SIGNATURE_RATIO : COMPACT_RATIO)),
		height,
		preload: priority,
	};
	const color = signature ? brandImages.logoColor : brandImages.logoColorCompact;
	const negative = signature ? brandImages.logoWhite : brandImages.logoWhiteCompact;

	if (inverted) {
		return (
			<Image
				{...shared}
				alt="Academia Pumangol"
				src={negative}
				className={["ap-logo", className].filter(Boolean).join(" ")}
			/>
		);
	}

	return (
		<>
			<Image
				{...shared}
				alt="Academia Pumangol"
				src={color}
				className={["ap-logo", "logo-light", className].filter(Boolean).join(" ")}
			/>
			<Image
				{...shared}
				alt="Academia Pumangol"
				src={negative}
				className={["ap-logo", "logo-dark", className].filter(Boolean).join(" ")}
			/>
		</>
	);
}

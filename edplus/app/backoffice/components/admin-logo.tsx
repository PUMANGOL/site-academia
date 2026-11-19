import Link from "next/link";
import SiteLogo from "@/app/components/site-logo";

export default function AdminLogo({ compact = false }: { compact?: boolean }) {
	return (
		<Link href="/backoffice" className="d-inline-flex align-items-center">
			<SiteLogo
				width={compact ? 140 : 180}
				height={compact ? 42 : 54}
				priority
			/>
		</Link>
	);
}

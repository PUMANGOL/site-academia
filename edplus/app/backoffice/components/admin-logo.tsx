import Link from "next/link";
import SiteLogo from "@/app/components/site-logo";

export default function AdminLogo({ compact = false }: { compact?: boolean }) {
	return (
		<Link href="/backoffice" className="d-inline-flex align-items-center">
			<SiteLogo height={compact ? 34 : 42} priority />
		</Link>
	);
}

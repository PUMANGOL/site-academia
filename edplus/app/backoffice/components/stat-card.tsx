import Link from "next/link";

export type StatTone = "blue" | "orange" | "green" | "yellow" | "teal";

const numberFormat = new Intl.NumberFormat("pt-PT");

export default function StatCard({
	label,
	value,
	icon,
	tone = "blue",
	hint,
	trend,
	href,
}: {
	label: string;
	value: number;
	icon: string;
	tone?: StatTone;
	hint?: React.ReactNode;
	trend?: string;
	href?: string;
}) {
	const className = `admin-stat-card admin-stat-tone-${tone}`;
	const content = (
		<>
			<div className="admin-stat-head">
				<p className="admin-stat-label">{label}</p>
				<span className="admin-stat-icon" aria-hidden>
					<i className={`ph ${icon}`} />
				</span>
			</div>
			<p className="admin-stat-value">{numberFormat.format(value)}</p>
			{hint || trend ? (
				<div className="admin-stat-meta">
					{trend ? <span className="admin-stat-trend">{trend}</span> : null}
					{hint ? <span className="admin-stat-hint">{hint}</span> : null}
				</div>
			) : null}
		</>
	);

	if (href) {
		return (
			<Link href={href} className={className}>
				{content}
			</Link>
		);
	}

	return <div className={className}>{content}</div>;
}

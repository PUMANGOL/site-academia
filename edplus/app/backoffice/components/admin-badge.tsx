type AdminBadgeVariant = "default" | "success" | "warning" | "muted" | "danger";

export default function AdminBadge({
	children,
	variant = "default",
}: {
	children: React.ReactNode;
	variant?: AdminBadgeVariant;
}) {
	return (
		<span className={`admin-badge admin-badge-${variant}`}>{children}</span>
	);
}

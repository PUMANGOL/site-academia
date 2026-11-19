export default function PageHeader({
	title,
	description,
	children,
	className,
}: {
	title: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={className ? `admin-page-header ${className}` : "admin-page-header"}>
			<div>
				<h2 className="admin-page-title">{title}</h2>
				{description ? (
					<p className="admin-page-description">{description}</p>
				) : null}
			</div>
			{children ? <div className="admin-page-actions">{children}</div> : null}
		</div>
	);
}

import type { EnrollmentStatus } from "@/db/schema";

const statusLabel: Record<EnrollmentStatus, string> = {
	not_started: "Não iniciado",
	in_progress: "Em progresso",
	completed: "Concluído",
};

type Props = {
	status: EnrollmentStatus;
	progress: number;
};

export default function EnrollmentProgressBar({ status, progress }: Props) {
	const value = status === "completed" ? 100 : status === "not_started" ? 0 : progress;

	return (
		<div className="admin-enrollment-progress">
			<div className="admin-progress-bar">
				<div className="admin-progress-bar-fill" style={{ width: `${value}%` }} />
			</div>
			<div className="admin-enrollment-progress-meta">
				<span>{statusLabel[status]}</span>
				<span>{value}%</span>
			</div>
		</div>
	);
}

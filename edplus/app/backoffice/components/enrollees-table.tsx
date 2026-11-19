"use client";

import { useState } from "react";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import {
	AdminFilterBar,
	AdminFilterDateRange,
	AdminFilterEmptyRow,
	AdminFilterSearch,
	AdminFilterSelect,
	emptyDateRange,
	hasDateRange,
	inDateRange,
	matchesSearch,
} from "@/app/backoffice/components/admin-filters";
import type { CourseEnrollee } from "@/db/queries/enrollments";
import type { EnrollmentStatus } from "@/db/schema/orders";

const statusLabel: Record<EnrollmentStatus, string> = {
	not_started: "Não iniciado",
	in_progress: "Em curso",
	completed: "Concluído",
};

const statusVariant: Record<
	EnrollmentStatus,
	"default" | "warning" | "success"
> = {
	not_started: "default",
	in_progress: "warning",
	completed: "success",
};

const statusOptions = (Object.keys(statusLabel) as EnrollmentStatus[]).map(
	(value) => ({ value, label: statusLabel[value] })
);

const dateFormat = new Intl.DateTimeFormat("pt-PT", {
	dateStyle: "medium",
	timeStyle: "short",
});

export default function EnrolleesTable({
	enrollees,
}: {
	enrollees: CourseEnrollee[];
}) {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [enrolledAt, setEnrolledAt] = useState(emptyDateRange);

	const filtered = enrollees.filter(
		(enrollee) =>
			matchesSearch(search, enrollee.name, enrollee.email) &&
			(!status || enrollee.status === status) &&
			inDateRange(enrollee.createdAt, enrolledAt)
	);

	return (
		<>
			<AdminFilterBar
				shown={filtered.length}
				total={enrollees.length}
				hasFilters={Boolean(search || status) || hasDateRange(enrolledAt)}
				onClear={() => {
					setSearch("");
					setStatus("");
					setEnrolledAt(emptyDateRange);
				}}
			>
				<AdminFilterSearch
					value={search}
					onChange={setSearch}
					placeholder="Pesquisar por nome ou e-mail"
				/>
				<AdminFilterSelect
					label="Estado"
					value={status}
					onChange={setStatus}
					options={statusOptions}
				/>
				<AdminFilterDateRange
					label="Data de inscrição"
					value={enrolledAt}
					onChange={setEnrolledAt}
				/>
			</AdminFilterBar>

			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Nome</th>
							<th>E-mail</th>
							<th>Estado</th>
							<th>Inscrição</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length === 0 ? <AdminFilterEmptyRow colSpan={4} /> : null}
						{filtered.map((enrollee) => (
							<tr key={enrollee.id}>
								<td className="fw-medium">{enrollee.name}</td>
								<td>{enrollee.email}</td>
								<td>
									<AdminBadge variant={statusVariant[enrollee.status]}>
										{statusLabel[enrollee.status]}
									</AdminBadge>
								</td>
								<td>{dateFormat.format(enrollee.createdAt)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

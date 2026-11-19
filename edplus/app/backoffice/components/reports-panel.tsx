"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { requestReport, type ReportRequestRow } from "@/app/actions/admin/reports";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import { reportDefinitionMap, reportDefinitions, roleLabels, type ReportType } from "@/lib/reports";

const statusView: Record<ReportRequestRow["status"], { label: string; variant: "success" | "warning" | "default" | "danger" }> = {
	pending: { label: "Na fila", variant: "default" },
	processing: { label: "A gerar", variant: "warning" },
	sent: { label: "Enviado", variant: "success" },
	failed: { label: "Falhou", variant: "danger" },
};

const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" });

export default function ReportsPanel({
	courses,
	recent,
	email,
}: {
	courses: { id: string; label: string }[];
	recent: ReportRequestRow[];
	email: string;
}) {
	const router = useRouter();
	const [type, setType] = useState<ReportType>("enrollments");
	const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
	const [pending, startTransition] = useTransition();
	const def = reportDefinitionMap.get(type)!;

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const value = (name: string) => String(form.get(name) ?? "") || undefined;
		setMessage(null);
		startTransition(async () => {
			const result = await requestReport(type, {
				from: value("from"),
				to: value("to"),
				courseId: value("courseId"),
				status: value("status"),
				role: value("role"),
			});
			if (!result.ok) {
				setMessage({ kind: "error", text: result.error });
				return;
			}
			setMessage({
				kind: "ok",
				text: result.duplicate
					? "Este relatório já foi pedido há instantes. Verifique o seu email."
					: `Pedido registado. O relatório em Excel vai ser enviado para ${result.email} dentro de instantes.`,
			});
			router.refresh();
		});
	}

	return (
		<div className="reports-layout">
			<div className="admin-form-panel">
				<p className="admin-label">Tipo de relatório</p>
				<div className="reports-types" role="radiogroup">
					{reportDefinitions.map((item) => (
						<button
							key={item.type}
							type="button"
							role="radio"
							aria-checked={type === item.type}
							className={`reports-type${type === item.type ? " is-active" : ""}`}
							onClick={() => {
								setType(item.type);
								setMessage(null);
							}}
						>
							<i className={`ph ${item.icon}`} aria-hidden />
							<span>
								<strong>{item.label}</strong>
								<small>{item.description}</small>
							</span>
						</button>
					))}
				</div>

				{/* key: limpa os filtros ao mudar de tipo */}
				<form key={type} onSubmit={onSubmit} className="admin-form-stack mt-4">
					<div className="admin-form-grid">
						{def.filters.includes("period") ? (
							<>
								<div>
									<label className="admin-label" htmlFor="from">
										{def.periodLabel}: de
									</label>
									<input id="from" name="from" type="date" className="admin-input form-control" />
								</div>
								<div>
									<label className="admin-label" htmlFor="to">
										até
									</label>
									<input id="to" name="to" type="date" className="admin-input form-control" />
								</div>
							</>
						) : null}
						{def.filters.includes("course") ? (
							<div>
								<label className="admin-label" htmlFor="courseId">
									Curso
								</label>
								<select id="courseId" name="courseId" className="admin-input form-select" defaultValue="">
									<option value="">Todos os cursos</option>
									{courses.map((course) => (
										<option key={course.id} value={course.id}>
											{course.label}
										</option>
									))}
								</select>
							</div>
						) : null}
						{def.filters.includes("status") ? (
							<div>
								<label className="admin-label" htmlFor="status">
									Estado
								</label>
								<select id="status" name="status" className="admin-input form-select" defaultValue="">
									<option value="">Todos</option>
									{def.statusOptions?.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						) : null}
						{def.filters.includes("role") ? (
							<div>
								<label className="admin-label" htmlFor="role">
									Perfil
								</label>
								<select id="role" name="role" className="admin-input form-select" defaultValue="">
									<option value="">Todos</option>
									{Object.entries(roleLabels).map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
							</div>
						) : null}
					</div>

					<p className="admin-help mb-0">
						O ficheiro Excel (com folha de resumo e folha de dados) é gerado em segundo plano e enviado
						para <strong>{email}</strong>. Contém dados pessoais: trate-o com confidencialidade.
					</p>

					{message ? (
						<p className={`mb-0 ${message.kind === "error" ? "admin-alert-error" : "pb-alert-ok"}`}>{message.text}</p>
					) : null}

					<div>
						<button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
							<i className="ph ph-microsoft-excel-logo" aria-hidden />
							{pending ? "A pedir..." : "Gerar e enviar por email"}
						</button>
					</div>
				</form>
			</div>

			<div className="admin-form-panel">
				<div className="d-flex align-items-center justify-content-between mb-3">
					<p className="admin-label mb-0">Os meus pedidos recentes</p>
					<button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => router.refresh()}>
						<i className="ph ph-arrows-clockwise" aria-hidden /> Actualizar
					</button>
				</div>
				{recent.length === 0 ? (
					<p className="admin-help mb-0">Ainda não pediu relatórios.</p>
				) : (
					<ul className="reports-recent">
						{recent.map((row) => {
							const view = statusView[row.status];
							return (
								<li key={row.id}>
									<div>
										<strong>{reportDefinitionMap.get(row.report)?.label ?? row.report}</strong>
										<p className="admin-help mb-0">
											{dateFormat.format(new Date(row.createdAt))}
											{row.filterSummary.length ? ` · ${row.filterSummary.join(" · ")}` : ""}
										</p>
									</div>
									<AdminBadge variant={view.variant}>{view.label}</AdminBadge>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}

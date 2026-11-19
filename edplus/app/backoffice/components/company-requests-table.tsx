"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateCompanyRequest } from "@/app/actions/admin/company-requests";
import { requestReport } from "@/app/actions/admin/reports";
import AdminBadge from "@/app/backoffice/components/admin-badge";
import AdminModal from "@/app/backoffice/components/admin-modal";
import {
	AdminFilterBar,
	AdminFilterEmptyRow,
	AdminFilterSearch,
	AdminFilterSelect,
	matchesSearch,
} from "@/app/backoffice/components/admin-filters";
import type { CompanyRequestStatus } from "@/db/schema";
import { companyRequestStatusLabels, trainingModalityLabels } from "@/lib/reports";

export type CompanyRequestRow = {
	id: string;
	companyName: string;
	contactName: string;
	jobTitle: string | null;
	email: string;
	phone: string | null;
	sector: string | null;
	participants: number | null;
	trainingAreas: string;
	modality: string;
	message: string | null;
	status: CompanyRequestStatus;
	internalNotes: string | null;
	handledByName: string | null;
	createdAt: Date;
};

const statusVariant: Record<CompanyRequestStatus, "default" | "warning" | "muted"> = {
	new: "default",
	in_progress: "warning",
	closed: "muted",
};

const statusOptions = Object.entries(companyRequestStatusLabels).map(([value, label]) => ({ value, label }));
const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" });

export default function CompanyRequestsTable({ requests }: { requests: CompanyRequestRow[] }) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [open, setOpen] = useState<CompanyRequestRow | null>(null);
	const [draftStatus, setDraftStatus] = useState<CompanyRequestStatus>("new");
	const [notes, setNotes] = useState("");
	const [error, setError] = useState("");
	const [exportMessage, setExportMessage] = useState("");

	const filtered = requests.filter(
		(row) =>
			matchesSearch(search, row.companyName, row.contactName, row.email, row.trainingAreas, row.sector) &&
			(!status || row.status === status)
	);

	function openRequest(row: CompanyRequestRow) {
		setOpen(row);
		setDraftStatus(row.status);
		setNotes(row.internalNotes ?? "");
		setError("");
	}

	function save() {
		if (!open) return;
		startTransition(async () => {
			const result = await updateCompanyRequest(open.id, { status: draftStatus, internalNotes: notes });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setOpen(null);
			router.refresh();
		});
	}

	function exportExcel() {
		startTransition(async () => {
			const result = await requestReport("companyRequests", status ? { status } : {});
			setExportMessage(
				result.ok ? `O Excel vai ser enviado para ${result.email} dentro de instantes.` : result.error
			);
		});
	}

	return (
		<>
			<div className="d-flex flex-wrap align-items-center justify-content-end gap-2 mb-3">
				{exportMessage ? <span className="admin-help mb-0">{exportMessage}</span> : null}
				<button type="button" className="admin-btn admin-btn-outline" onClick={exportExcel} disabled={pending}>
					<i className="ph ph-microsoft-excel-logo" aria-hidden /> Exportar para Excel
				</button>
			</div>

			{requests.length === 0 ? (
				<div className="admin-empty">
					Ainda não há pedidos. Os pedidos enviados no formulário da página Parceiros aparecem aqui.
				</div>
			) : (
				<>
					<AdminFilterBar
						shown={filtered.length}
						total={requests.length}
						hasFilters={Boolean(search || status)}
						onClear={() => {
							setSearch("");
							setStatus("");
						}}
					>
						<AdminFilterSearch
							value={search}
							onChange={setSearch}
							placeholder="Pesquisar por empresa, contacto, email ou área"
						/>
						<AdminFilterSelect label="Estado" value={status} onChange={setStatus} options={statusOptions} />
					</AdminFilterBar>
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>Empresa</th>
									<th>Contacto</th>
									<th>Participantes</th>
									<th>Estado</th>
									<th>Recebido</th>
									<th className="text-end">Ações</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? <AdminFilterEmptyRow colSpan={6} /> : null}
								{filtered.map((row) => (
									<tr key={row.id}>
										<td>
											<p className="mb-0 fw-medium">{row.companyName}</p>
											<p className="mb-0 small text-muted text-truncate" style={{ maxWidth: 320 }}>
												{row.trainingAreas}
											</p>
										</td>
										<td>
											<p className="mb-0">{row.contactName}</p>
											<p className="mb-0 small text-muted">{row.email}</p>
										</td>
										<td>{row.participants ?? "—"}</td>
										<td>
											<AdminBadge variant={statusVariant[row.status]}>
												{companyRequestStatusLabels[row.status]}
											</AdminBadge>
										</td>
										<td>{dateFormat.format(row.createdAt)}</td>
										<td className="text-end">
											<button
												type="button"
												className="admin-btn admin-btn-outline admin-btn-sm"
												onClick={() => openRequest(row)}
											>
												Abrir
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			<AdminModal
				open={open !== null}
				onClose={() => setOpen(null)}
				title={open ? `Pedido de ${open.companyName}` : ""}
				size="lg"
				footer={
					<>
						<button type="button" className="admin-btn admin-btn-outline" onClick={() => setOpen(null)}>
							Fechar
						</button>
						<button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={pending}>
							{pending ? "A guardar..." : "Guardar"}
						</button>
					</>
				}
			>
				{open ? (
					<div className="admin-form-stack">
						<dl className="request-details">
							<dt>Contacto</dt>
							<dd>
								{open.contactName}
								{open.jobTitle ? ` · ${open.jobTitle}` : ""}
							</dd>
							<dt>Email</dt>
							<dd>
								<a href={`mailto:${open.email}`}>{open.email}</a>
							</dd>
							{open.phone ? (
								<>
									<dt>Telefone</dt>
									<dd>
										<a href={`tel:${open.phone}`}>{open.phone}</a>
									</dd>
								</>
							) : null}
							{open.sector ? (
								<>
									<dt>Sector</dt>
									<dd>{open.sector}</dd>
								</>
							) : null}
							<dt>Participantes</dt>
							<dd>{open.participants ?? "Não indicado"}</dd>
							<dt>Modalidade</dt>
							<dd>{trainingModalityLabels[open.modality] ?? open.modality}</dd>
							<dt>Áreas de formação</dt>
							<dd className="cms-pre-line">{open.trainingAreas}</dd>
							{open.message ? (
								<>
									<dt>Mensagem</dt>
									<dd className="cms-pre-line">{open.message}</dd>
								</>
							) : null}
							<dt>Recebido</dt>
							<dd>
								{dateFormat.format(open.createdAt)}
								{open.handledByName ? ` · última actualização por ${open.handledByName}` : ""}
							</dd>
						</dl>
						<div className="admin-form-grid">
							<div>
								<label className="admin-label" htmlFor="request-status">
									Estado
								</label>
								<select
									id="request-status"
									className="admin-input form-select"
									value={draftStatus}
									onChange={(event) => setDraftStatus(event.target.value as CompanyRequestStatus)}
								>
									{statusOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</div>
						<div>
							<label className="admin-label" htmlFor="request-notes">
								Notas internas
							</label>
							<textarea
								id="request-notes"
								className="admin-input form-control"
								rows={4}
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
								placeholder="Ex.: proposta enviada a 12/10, aguarda resposta."
							/>
						</div>
						{error ? <p className="admin-alert-error mb-0">{error}</p> : null}
					</div>
				) : null}
			</AdminModal>
		</>
	);
}

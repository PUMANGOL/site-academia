"use client";

export type FilterOption = { value: string; label: string };

export type DateRangeValue = { from: string; to: string };

export const emptyDateRange: DateRangeValue = { from: "", to: "" };

// Pesquisa sem distinção de maiúsculas nem acentos ("formacao" encontra "Formação").
export function normalizeSearch(value: string) {
	return value
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim();
}

export function matchesSearch(query: string, ...fields: (string | null | undefined)[]) {
	const needle = normalizeSearch(query);
	if (!needle) return true;
	return fields.some((field) => field && normalizeSearch(field).includes(needle));
}

// Converte "YYYY-MM-DD" (valor do <input type="date">) para meia-noite local.
export function parseDateInput(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return Number.isNaN(date.getTime()) ? null : date;
}

// A data final é inclusiva: aceita tudo até ao fim desse dia.
export function inDateRange(date: Date, range: DateRangeValue) {
	const from = parseDateInput(range.from);
	const to = parseDateInput(range.to);
	if (from && date < from) return false;
	if (to) {
		const end = new Date(to);
		end.setDate(end.getDate() + 1);
		if (date >= end) return false;
	}
	return true;
}

export function hasDateRange(range: DateRangeValue) {
	return Boolean(range.from || range.to);
}

export function AdminFilterBar({
	children,
	shown,
	total,
	hasFilters,
	onClear,
	actions,
}: {
	children: React.ReactNode;
	shown?: number;
	total?: number;
	hasFilters?: boolean;
	onClear?: () => void;
	actions?: React.ReactNode;
}) {
	const showCount = shown !== undefined && total !== undefined;
	const showMeta = showCount || (hasFilters && onClear) || actions;

	return (
		<div className="admin-filter-wrap">
			<div className="admin-filter-bar">{children}</div>
			{showMeta ? (
				<div className="admin-filter-meta">
					<div className="admin-filter-summary">
						{showCount ? (
							<span className="admin-filter-count">
								{shown === total
									? `${total} ${total === 1 ? "resultado" : "resultados"}`
									: `${shown} de ${total} resultados`}
							</span>
						) : null}
						{hasFilters && onClear ? (
							<button
								type="button"
								className="admin-filter-clear"
								onClick={onClear}
							>
								<i className="ph ph-x" aria-hidden />
								Limpar filtros
							</button>
						) : null}
					</div>
					{actions ? <div className="admin-filter-actions">{actions}</div> : null}
				</div>
			) : null}
		</div>
	);
}

function FilterField({
	label,
	htmlFor,
	size = "md",
	children,
}: {
	label: string;
	htmlFor?: string;
	size?: "sm" | "md" | "lg" | "dates";
	children: React.ReactNode;
}) {
	return (
		<div className={`admin-filter-field admin-filter-field-${size}`}>
			{htmlFor ? (
				<label htmlFor={htmlFor} className="admin-filter-label">
					{label}
				</label>
			) : (
				<span className="admin-filter-label">{label}</span>
			)}
			{children}
		</div>
	);
}

function fieldId(label: string) {
	return `filter-${normalizeSearch(label).replace(/[^a-z0-9]+/g, "-")}`;
}

export function AdminFilterSearch({
	value,
	onChange,
	placeholder = "Pesquisar...",
	label = "Pesquisar",
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
}) {
	const id = fieldId(label);

	return (
		<FilterField label={label} htmlFor={id} size="lg">
			<div className="admin-filter-search">
				<i className="ph ph-magnifying-glass" aria-hidden />
				<input
					id={id}
					type="search"
					className="admin-input form-control"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
				/>
			</div>
		</FilterField>
	);
}

export function AdminFilterSelect({
	label,
	value,
	onChange,
	options,
	allLabel = "Todos",
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: FilterOption[];
	allLabel?: string | null;
}) {
	const id = fieldId(label);

	return (
		<FilterField label={label} htmlFor={id}>
			<select
				id={id}
				className="admin-input form-select"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				{allLabel !== null ? <option value="">{allLabel}</option> : null}
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</FilterField>
	);
}

export function AdminFilterDateRange({
	label,
	value,
	onChange,
}: {
	label: string;
	value: DateRangeValue;
	onChange: (value: DateRangeValue) => void;
}) {
	const id = fieldId(label);

	return (
		<FilterField label={label} htmlFor={`${id}-from`} size="dates">
			<div className="admin-filter-dates">
				<input
					id={`${id}-from`}
					type="date"
					className="admin-input form-control"
					value={value.from}
					max={value.to || undefined}
					onChange={(event) => onChange({ ...value, from: event.target.value })}
					aria-label={`${label}: de`}
				/>
				<span className="admin-filter-dates-sep" aria-hidden>
					<i className="ph ph-arrow-right" />
				</span>
				<input
					type="date"
					className="admin-input form-control"
					value={value.to}
					min={value.from || undefined}
					onChange={(event) => onChange({ ...value, to: event.target.value })}
					aria-label={`${label}: até`}
				/>
			</div>
		</FilterField>
	);
}

export function AdminFilterEmptyRow({ colSpan }: { colSpan: number }) {
	return (
		<tr>
			<td colSpan={colSpan} className="admin-table-empty">
				Nenhum resultado corresponde aos filtros aplicados.
			</td>
		</tr>
	);
}

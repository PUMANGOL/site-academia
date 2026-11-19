"use client";

import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, useState } from "react";
import MediaField from "@/app/backoffice/components/media-field";
import RichTextEditor from "@/app/backoffice/components/rich-text-editor";
import type { BlockValue, Localized, LocalizedRichText } from "@/db/schema";
import { messageText, type FieldDef, type ListDef } from "@/lib/page-blocks";

type Values = Record<string, BlockValue>;

const emptyLocalized: Localized = { pt: "", en: "" };

function placeholderFor(field: FieldDef): Localized {
	if (field.fallbackKey) return messageText(field.fallbackKey);
	if (typeof field.fallback === "string") return { pt: field.fallback, en: field.fallback };
	return emptyLocalized;
}

export function BlockField({
	field,
	value,
	onChange,
}: {
	field: FieldDef;
	value: BlockValue | undefined;
	onChange: (value: BlockValue) => void;
}) {
	const placeholder = placeholderFor(field);
	const id = useId();

	switch (field.kind) {
		case "text":
		case "textarea": {
			const Input = field.kind === "textarea" ? "textarea" : "input";
			if (!field.localized) {
				return (
					<div>
						<label className="admin-label" htmlFor={id}>
							{field.label}
						</label>
						<Input
							id={id}
							className="admin-input form-control"
							value={typeof value === "string" ? value : ""}
							placeholder={placeholder.pt}
							rows={field.kind === "textarea" ? 3 : undefined}
							onChange={(event) => onChange(event.target.value)}
						/>
						{field.hint ? <p className="admin-help">{field.hint}</p> : null}
					</div>
				);
			}
			const localized = (value as Localized | undefined) ?? emptyLocalized;
			return (
				<div className="pb-field-wide">
					<p className="admin-label">{field.label}</p>
					<div className="pb-localized">
						{(["pt", "en"] as const).map((locale) => (
							<div key={locale} className="pb-localized-input">
								<span className="pb-locale-tag">{locale.toUpperCase()}</span>
								<Input
									aria-label={`${field.label} (${locale.toUpperCase()})`}
									className="admin-input form-control"
									value={localized[locale] ?? ""}
									// Sem tradução, o site usa o texto PT; o placeholder mostra isso mesmo.
									placeholder={
										locale === "en" && localized.pt?.trim() ? localized.pt : placeholder[locale]
									}
									rows={field.kind === "textarea" ? 3 : undefined}
									onChange={(event) =>
										onChange({ ...localized, [locale]: event.target.value })
									}
								/>
							</div>
						))}
					</div>
					{field.fallbackKey ? (
						<p className="admin-help">
							Vazio = texto a cinzento. Sem inglês, o site mostra o texto em português.
						</p>
					) : null}
				</div>
			);
		}
		case "richtext":
			return (
				<LocalizedRichTextField
					label={field.label}
					value={value as LocalizedRichText | undefined}
					onChange={onChange}
				/>
			);
		case "image":
			return (
				<div className="pb-field-wide">
					<MediaField
						label={field.label}
						value={typeof value === "string" ? value : ""}
						onChange={onChange}
						placeholder={placeholder.pt}
						hint={field.hint}
					/>
				</div>
			);
		case "url":
			return (
				<div>
					<label className="admin-label" htmlFor={id}>
						{field.label}
					</label>
					<input
						id={id}
						className="admin-input form-control"
						value={typeof value === "string" ? value : ""}
						placeholder={placeholder.pt || "/pagina ou https://..."}
						onChange={(event) => onChange(event.target.value)}
					/>
				</div>
			);
		case "select":
			return (
				<div>
					<label className="admin-label" htmlFor={id}>
						{field.label}
					</label>
					<select
						id={id}
						className="admin-input form-select"
						value={typeof value === "string" ? value : String(field.fallback ?? "")}
						onChange={(event) => onChange(event.target.value)}
					>
						{field.options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			);
		case "boolean":
			return (
				<div className="pb-field-wide">
					<label className="admin-check-row">
						<input
							className="form-check-input"
							type="checkbox"
							checked={typeof value === "boolean" ? value : field.fallback === true}
							onChange={(event) => onChange(event.target.checked)}
						/>
						{field.label}
					</label>
					{field.hint ? <p className="admin-help mb-0">{field.hint}</p> : null}
				</div>
			);
	}
}

function LocalizedRichTextField({
	label,
	value,
	onChange,
}: {
	label: string;
	value: LocalizedRichText | undefined;
	onChange: (value: LocalizedRichText) => void;
}) {
	const [locale, setLocale] = useState<"pt" | "en">("pt");
	const current = value ?? { pt: null, en: null };

	return (
		<div className="pb-field-wide">
			<div className="d-flex align-items-center justify-content-between mb-2">
				<p className="admin-label mb-0">{label}</p>
				<div className="pb-locale-switch" role="tablist">
					{(["pt", "en"] as const).map((item) => (
						<button
							key={item}
							type="button"
							role="tab"
							aria-selected={locale === item}
							className={locale === item ? "is-active" : undefined}
							onClick={() => setLocale(item)}
						>
							{item.toUpperCase()}
						</button>
					))}
				</div>
			</div>
			{(["pt", "en"] as const).map((item) => (
				<div key={item} hidden={locale !== item}>
					<RichTextEditor
						value={current[item]}
						onChange={(doc) => onChange({ ...current, [item]: doc })}
					/>
				</div>
			))}
			{locale === "en" ? (
				<p className="admin-help">Se ficar vazio, o site mostra o texto em português.</p>
			) : null}
		</div>
	);
}

export function BlockFields({
	fields,
	values,
	onChange,
}: {
	fields: FieldDef[];
	values: Values;
	onChange: (name: string, value: BlockValue) => void;
}) {
	if (!fields.length) return null;
	return (
		<div className="pb-fields">
			{fields.map((field) => (
				<BlockField
					key={field.name}
					field={field}
					value={values[field.name]}
					onChange={(value) => onChange(field.name, value)}
				/>
			))}
		</div>
	);
}

// Ids locais só para o drag and drop; os itens guardados não têm id.
let itemSeq = 0;
const newItemId = () => `item-${++itemSeq}`;

export function BlockList({
	list,
	items,
	onChange,
}: {
	list: ListDef;
	items: Values[] | undefined;
	onChange: (items: Values[]) => void;
}) {
	const current = items ?? [];
	const [ids, setIds] = useState(() => current.map(newItemId));
	const [open, setOpen] = useState<string | null>(null);
	// Desfazer/refazer pode mudar a lista por fora: realinha os ids.
	const itemIds = ids.length === current.length ? ids : current.map((_, i) => ids[i] ?? newItemId());
	if (itemIds !== ids) setIds(itemIds);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	function update(nextItems: Values[], nextIds: string[]) {
		setIds(nextIds);
		onChange(nextItems);
	}

	function onDragEnd({ active, over }: DragEndEvent) {
		if (!over || active.id === over.id) return;
		const from = itemIds.indexOf(String(active.id));
		const to = itemIds.indexOf(String(over.id));
		update(arrayMove(current, from, to), arrayMove(itemIds, from, to));
	}

	function itemTitle(item: Values, index: number) {
		for (const field of list.fields) {
			const value = item[field.name];
			const text = typeof value === "string" ? value : (value as Localized | undefined)?.pt;
			if (field.kind !== "image" && field.kind !== "url" && text?.trim()) return text;
		}
		return `${list.itemLabel} ${index + 1}`;
	}

	function add() {
		const id = newItemId();
		update([...current, {}], [...itemIds, id]);
		setOpen(id);
	}

	const hasDefaults = list.defaultItems.length > 0;
	const full = current.length >= list.max;

	return (
		<div className="pb-list">
			<div className="d-flex align-items-center justify-content-between">
				<p className="admin-label mb-0">
					{list.label}{" "}
					<span className="text-muted small">
						({current.length}/{list.max})
					</span>
				</p>
				{current.length && hasDefaults ? (
					<button
						type="button"
						className="admin-btn admin-btn-ghost admin-btn-sm"
						onClick={() => update([], [])}
						title="Voltar aos itens padrão"
					>
						Repor padrão
					</button>
				) : null}
			</div>

			{current.length === 0 ? (
				<div className="pb-list-empty">
					{hasDefaults ? (
						<>
							<p className="mb-2">A mostrar os {list.defaultItems.length} itens padrão.</p>
							<button
								type="button"
								className="admin-btn admin-btn-outline admin-btn-sm"
								onClick={() => {
									const copy = structuredClone(list.defaultItems) as Values[];
									const copyIds = copy.map(newItemId);
									update(copy, copyIds);
									setOpen(copyIds[0]);
								}}
							>
								Personalizar itens
							</button>
						</>
					) : (
						<>
							<p className="mb-2">Ainda não há {list.label.toLowerCase()}. O bloco não aparece no site sem itens.</p>
							<button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={add}>
								<i className="ph ph-plus" aria-hidden /> Adicionar {list.itemLabel.toLowerCase()}
							</button>
						</>
					)}
				</div>
			) : (
				<DndContext id={`list-${list.name}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
					<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
						<ul className="pb-list-items">
							{current.map((item, index) => {
								const id = itemIds[index];
								return (
									<SortableItem
										key={id}
										id={id}
										title={itemTitle(item, index)}
										open={open === id}
										canDuplicate={!full}
										onToggle={() => setOpen(open === id ? null : id)}
										onDuplicate={() => {
											const copyId = newItemId();
											update(
												[...current.slice(0, index + 1), structuredClone(item), ...current.slice(index + 1)],
												[...itemIds.slice(0, index + 1), copyId, ...itemIds.slice(index + 1)]
											);
											setOpen(copyId);
										}}
										onRemove={() =>
											update(
												current.filter((_, i) => i !== index),
												itemIds.filter((_, i) => i !== index)
											)
										}
									>
										<BlockFields
											fields={list.fields}
											values={item}
											onChange={(name, value) =>
												onChange(current.map((entry, i) => (i === index ? { ...entry, [name]: value } : entry)))
											}
										/>
									</SortableItem>
								);
							})}
						</ul>
					</SortableContext>
				</DndContext>
			)}

			{current.length > 0 && !full ? (
				<button type="button" className="admin-btn admin-btn-outline admin-btn-sm mt-2" onClick={add}>
					<i className="ph ph-plus" aria-hidden /> Adicionar {list.itemLabel.toLowerCase()}
				</button>
			) : null}
		</div>
	);
}

function SortableItem({
	id,
	title,
	open,
	canDuplicate,
	onToggle,
	onDuplicate,
	onRemove,
	children,
}: {
	id: string;
	title: string;
	open: boolean;
	canDuplicate: boolean;
	onToggle: () => void;
	onDuplicate: () => void;
	onRemove: () => void;
	children: React.ReactNode;
}) {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
		useSortable({ id });

	return (
		<li
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={`pb-list-item${isDragging ? " is-dragging" : ""}`}
		>
			<div className="pb-list-item-head">
				<button
					type="button"
					ref={setActivatorNodeRef}
					className="pb-drag pb-drag-sm"
					title="Arrastar para reordenar"
					{...attributes}
					{...listeners}
				>
					<i className="ph ph-dots-six-vertical" aria-hidden />
				</button>
				<button type="button" className="pb-list-item-toggle" onClick={onToggle} aria-expanded={open}>
					<i className={`ph ${open ? "ph-caret-down" : "ph-caret-right"}`} aria-hidden />
					{title}
				</button>
				<div className="pb-icon-actions">
					<button type="button" title="Duplicar" onClick={onDuplicate} disabled={!canDuplicate}>
						<i className="ph ph-copy" aria-hidden />
					</button>
					<button type="button" title="Remover" className="is-danger" onClick={onRemove}>
						<i className="ph ph-trash" aria-hidden />
					</button>
				</div>
			</div>
			{open ? children : null}
		</li>
	);
}
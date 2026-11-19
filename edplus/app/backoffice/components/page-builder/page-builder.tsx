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
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
	discardPageDraft,
	getPageVersionBlocks,
	listPageVersions,
	publishPage,
	savePageDraft,
	type PageVersionSummary,
} from "@/app/actions/admin/pages";
import AdminModal from "@/app/backoffice/components/admin-modal";
import type { PreviewMessage } from "@/app/components/page-blocks/live-preview";
import type { BlockValue, Localized, PageBlock, PageBlockSettings } from "@/db/schema";
import {
	ANCHOR_PATTERN,
	blockDefinitionMap,
	editablePages,
	messageText,
	type BlockDef,
	type EditablePageSlug,
} from "@/lib/page-blocks";
import { BlockFields, BlockList } from "./block-fields";
import BlockPicker from "./block-picker";
import { useHistory } from "./use-history";

// crypto.randomUUID só existe em contexto seguro (https/localhost); o backoffice também é aberto por IP.
function newBlockId() {
	return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function blockSummary(block: PageBlock, def: BlockDef) {
	for (const name of ["title", "title1", "eyebrow"]) {
		const value = block.data[name] as Localized | undefined;
		if (value?.pt?.trim()) return value.pt;
		const fallbackKey = def.fields.find((field) => field.name === name)?.fallbackKey;
		if (fallbackKey) return messageText(fallbackKey).pt;
	}
	return def.description;
}

const CLIPBOARD_KEY = "academia-pb-clipboard";

type Clipboard = { block: PageBlock; from: string };

function readClipboard(): Clipboard | null {
	try {
		const raw = window.localStorage.getItem(CLIPBOARD_KEY);
		const parsed = raw ? (JSON.parse(raw) as Clipboard) : null;
		return parsed && blockDefinitionMap.has(parsed.block?.type) ? parsed : null;
	} catch {
		return null;
	}
}

function isEditableTarget(target: EventTarget | null) {
	const element = target as HTMLElement | null;
	return Boolean(
		element?.closest("input, textarea, select, [contenteditable='true']")
	);
}

const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" });

export default function PageBuilder({
	slug,
	initialBlocks,
	initialPublishedAt,
	hasUnpublishedChanges,
}: {
	slug: EditablePageSlug;
	initialBlocks: PageBlock[];
	initialPublishedAt: string | null;
	hasUnpublishedChanges: boolean;
}) {
	const page = editablePages[slug];
	const history = useHistory(initialBlocks);
	const blocks = history.value;
	const setBlocks = history.set;
	const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialBlocks));
	const [unpublished, setUnpublished] = useState(hasUnpublishedChanges);
	const [publishedAt, setPublishedAt] = useState(initialPublishedAt);
	const [expanded, setExpanded] = useState<string | null>(null);
	const [paletteAt, setPaletteAt] = useState<number | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<PageBlock | null>(null);
	const [confirm, setConfirm] = useState<"discard" | "reset" | null>(null);
	const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
	const [pending, startTransition] = useTransition();
	const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
	const [clipboard, setClipboard] = useState<Clipboard | null>(null);
	const [versions, setVersions] = useState<PageVersionSummary[] | null>(null);
	const [versionsOpen, setVersionsOpen] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const dirty = JSON.stringify(blocks) !== savedJson;

	// ---------- Pré-visualização ao vivo ----------

	const sendToPreview = useCallback((message: PreviewMessage) => {
		iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
	}, []);

	const blocksRef = useRef(blocks);
	useEffect(() => {
		blocksRef.current = blocks;
		const timer = window.setTimeout(
			() => sendToPreview({ source: "pb-editor", type: "blocks", blocks }),
			120
		);
		return () => window.clearTimeout(timer);
	}, [blocks, sendToPreview]);

	useEffect(() => {
		function onMessage(event: MessageEvent<PreviewMessage>) {
			if (event.origin !== window.location.origin || event.data?.source !== "pb-preview") return;
			if (event.data.type === "ready") {
				sendToPreview({ source: "pb-editor", type: "blocks", blocks: blocksRef.current });
			}
			if (event.data.type === "select") {
				const { id } = event.data;
				setExpanded(id);
				requestAnimationFrame(() =>
					document.getElementById(`pb-block-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
				);
			}
		}
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [sendToPreview]);

	function toggleBlock(id: string) {
		const next = expanded === id ? null : id;
		setExpanded(next);
		if (next) sendToPreview({ source: "pb-editor", type: "focus", id: next });
	}

	// ---------- Atalhos, aviso de saída e área de transferência ----------

	const saveRef = useRef<() => void>(() => {});

	useEffect(() => {
		function onKey(event: KeyboardEvent) {
			if (!(event.ctrlKey || event.metaKey)) return;
			const key = event.key.toLowerCase();
			if (key === "s") {
				event.preventDefault();
				saveRef.current();
				return;
			}
			// Dentro de um campo, o desfazer nativo do browser tem prioridade.
			if (isEditableTarget(event.target)) return;
			if (key === "z" && !event.shiftKey) {
				event.preventDefault();
				history.undo();
			} else if (key === "y" || (key === "z" && event.shiftKey)) {
				event.preventDefault();
				history.redo();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [history]);

	useEffect(() => {
		if (!dirty) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);

	useEffect(() => {
		const sync = () => setClipboard(readClipboard());
		sync();
		window.addEventListener("storage", sync);
		return () => window.removeEventListener("storage", sync);
	}, []);

	function copyBlock(block: PageBlock) {
		const value: Clipboard = { block, from: page.title };
		window.localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(value));
		setClipboard(value);
		setMessage({
			kind: "ok",
			text: `Bloco "${blockDefinitionMap.get(block.type)?.label}" copiado. Pode colá-lo nesta ou noutra página.`,
		});
	}

	// ---------- Edição dos blocos ----------

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	function onDragEnd({ active, over }: DragEndEvent) {
		if (!over || active.id === over.id) return;
		setBlocks((current) => {
			const from = current.findIndex((block) => block.id === active.id);
			const to = current.findIndex((block) => block.id === over.id);
			return arrayMove(current, from, to);
		});
	}

	function updateBlock(id: string, update: (block: PageBlock) => PageBlock, key?: string) {
		setBlocks((current) => current.map((block) => (block.id === id ? update(block) : block)), key);
	}

	function setData(id: string, name: string, value: BlockValue) {
		updateBlock(id, (block) => ({ ...block, data: { ...block.data, [name]: value } }), `data:${id}:${name}`);
	}

	function setSettings(id: string, settings: PageBlockSettings, key: string) {
		updateBlock(id, (block) => ({ ...block, settings: { ...block.settings, ...settings } }), key);
	}

	function insertBlock(block: PageBlock) {
		setBlocks((current) => {
			const index = paletteAt ?? current.length;
			return [...current.slice(0, index), block, ...current.slice(index)];
		});
		setPaletteAt(null);
		setExpanded(block.id);
	}

	function duplicateBlock(block: PageBlock) {
		const copy = { ...structuredClone(block), id: newBlockId() };
		if (copy.settings?.anchor) copy.settings = { ...copy.settings, anchor: undefined };
		setBlocks((current) => {
			const index = current.findIndex((item) => item.id === block.id);
			return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
		});
		setExpanded(copy.id);
	}

	function pasteBlock() {
		if (!clipboard) return;
		const copy = { ...structuredClone(clipboard.block), id: newBlockId() };
		if (copy.settings?.anchor) copy.settings = { ...copy.settings, anchor: undefined };
		insertBlock(copy);
	}

	// ---------- Guardar, publicar, histórico ----------

	function run(action: () => Promise<void>) {
		setMessage(null);
		startTransition(action);
	}

	function save() {
		if (pending || !dirty) return;
		run(async () => {
			const result = await savePageDraft(slug, blocks);
			if (!result.ok) return setMessage({ kind: "error", text: result.error });
			setSavedJson(JSON.stringify(blocks));
			setUnpublished(true);
			setMessage({ kind: "ok", text: "Rascunho guardado." });
		});
	}
	useEffect(() => {
		saveRef.current = save;
	});

	function publish() {
		run(async () => {
			const result = await publishPage(slug, blocks);
			if (!result.ok) return setMessage({ kind: "error", text: result.error });
			setSavedJson(JSON.stringify(blocks));
			setUnpublished(false);
			setPublishedAt(result.publishedAt ?? new Date().toISOString());
			setVersions(null);
			setMessage({ kind: "ok", text: "Página publicada no site." });
		});
	}

	function discard() {
		run(async () => {
			const result = await discardPageDraft(slug);
			setConfirm(null);
			if (!result.ok) return setMessage({ kind: "error", text: result.error });
			setBlocks(() => result.blocks);
			setSavedJson(JSON.stringify(result.blocks));
			setUnpublished(false);
			setMessage({ kind: "ok", text: "Alterações descartadas. Pode desfazer com Ctrl+Z." });
		});
	}

	function resetToDefault() {
		setBlocks(() => structuredClone(page.defaultBlocks));
		setConfirm(null);
		setMessage({ kind: "ok", text: "Layout padrão reposto. Guarde ou publique para aplicar." });
	}

	function openVersions() {
		setVersionsOpen(true);
		if (versions) return;
		run(async () => {
			const result = await listPageVersions(slug);
			if (!result.ok) return setMessage({ kind: "error", text: result.error });
			setVersions(result.versions);
		});
	}

	function restoreVersion(version: PageVersionSummary) {
		run(async () => {
			const result = await getPageVersionBlocks(version.id);
			if (!result.ok) return setMessage({ kind: "error", text: result.error });
			setBlocks(() => result.blocks);
			setVersionsOpen(false);
			setMessage({
				kind: "ok",
				text: `Versão de ${dateFormat.format(new Date(version.createdAt))} carregada no editor. Publique para a repor no site.`,
			});
		});
	}

	const status = dirty
		? { label: "Alterações por guardar", variant: "warning" }
		: unpublished
			? { label: "Rascunho por publicar", variant: "default" }
			: publishedAt
				? { label: "Publicado", variant: "success" }
				: { label: "Layout padrão", variant: "muted" };

	return (
		<div className="pb-layout">
			<div className="pb-editor">
				<div className="pb-toolbar">
					<div>
						<span className={`admin-badge admin-badge-${status.variant}`}>{status.label}</span>
						<p className="admin-help mb-0 mt-1">
							{publishedAt
								? `Última publicação: ${dateFormat.format(new Date(publishedAt))}`
								: "Ainda não publicada: o site mostra o layout padrão."}
						</p>
					</div>
					<div className="d-flex flex-wrap align-items-center gap-2">
						<div className="pb-icon-actions">
							<button type="button" title="Desfazer (Ctrl+Z)" onClick={history.undo} disabled={!history.canUndo}>
								<i className="ph ph-arrow-counter-clockwise" aria-hidden />
							</button>
							<button type="button" title="Refazer (Ctrl+Y)" onClick={history.redo} disabled={!history.canRedo}>
								<i className="ph ph-arrow-clockwise" aria-hidden />
							</button>
							<button type="button" title="Histórico de publicações" onClick={openVersions}>
								<i className="ph ph-clock-counter-clockwise" aria-hidden />
							</button>
						</div>
						<button
							type="button"
							className="admin-btn admin-btn-outline"
							onClick={save}
							disabled={pending || !dirty}
							title="Ctrl+S"
						>
							Guardar rascunho
						</button>
						<button
							type="button"
							className="admin-btn admin-btn-primary"
							onClick={publish}
							disabled={pending || (!dirty && !unpublished && publishedAt !== null)}
						>
							{pending ? "A processar..." : "Publicar"}
						</button>
					</div>
				</div>

				{message ? (
					<p className={message.kind === "error" ? "admin-alert-error" : "pb-alert-ok"}>
						{message.text}
					</p>
				) : null}

				<DndContext
					id="page-builder"
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={onDragEnd}
				>
					<SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
						<ol className="pb-blocks">
							{blocks.map((block, index) => (
								<SortableBlock
									key={block.id}
									block={block}
									pagePath={page.path}
									expanded={expanded === block.id}
									onToggle={() => toggleBlock(block.id)}
									onHide={() => updateBlock(block.id, (b) => ({ ...b, hidden: !b.hidden }))}
									onDuplicate={() => duplicateBlock(block)}
									onCopy={() => copyBlock(block)}
									onDelete={() => setDeleteTarget(block)}
									onInsertBelow={() => setPaletteAt(index + 1)}
									onData={(name, value) => setData(block.id, name, value)}
									onSettings={(settings, key) => setSettings(block.id, settings, `settings:${block.id}:${key}`)}
								/>
							))}
						</ol>
					</SortableContext>
				</DndContext>

				{blocks.length === 0 ? (
					<div className="admin-empty">A página não tem blocos. Adicione o primeiro.</div>
				) : null}

				<div className="d-flex flex-wrap gap-2 justify-content-between mt-3">
					<div className="d-flex flex-wrap gap-2">
						<button
							type="button"
							className="admin-btn admin-btn-secondary"
							onClick={() => setPaletteAt(blocks.length)}
						>
							<i className="ph ph-plus" aria-hidden /> Adicionar bloco
						</button>
						{clipboard ? (
							<button
								type="button"
								className="admin-btn admin-btn-outline"
								onClick={pasteBlock}
								title={`Copiado de: ${clipboard.from}`}
							>
								<i className="ph ph-clipboard-text" aria-hidden /> Colar &quot;
								{blockDefinitionMap.get(clipboard.block.type)?.label}&quot;
							</button>
						) : null}
					</div>
					<div className="d-flex flex-wrap gap-2">
						{unpublished || dirty ? (
							<button
								type="button"
								className="admin-btn admin-btn-ghost"
								onClick={() => setConfirm("discard")}
								disabled={pending}
							>
								Descartar alterações
							</button>
						) : null}
						<button
							type="button"
							className="admin-btn admin-btn-ghost"
							onClick={() => setConfirm("reset")}
							disabled={pending}
						>
							Repor layout padrão
						</button>
					</div>
				</div>
				<p className="admin-help mt-3 mb-0">
					Atalhos: Ctrl+S guarda o rascunho · Ctrl+Z / Ctrl+Y desfaz e refaz (fora dos campos de texto) ·
					na pré-visualização, passe o rato num bloco e clique em &quot;editar&quot;.
				</p>
			</div>

			<Preview
				slug={slug}
				path={page.path}
				device={device}
				onDevice={setDevice}
				iframeRef={iframeRef}
			/>

			<AdminModal
				open={paletteAt !== null}
				onClose={() => setPaletteAt(null)}
				title={paletteAt !== null && paletteAt < blocks.length ? `Inserir bloco na posição ${paletteAt + 1}` : "Adicionar bloco"}
				size="xl"
			>
				<BlockPicker
					suggested={page.suggested}
					usedTypes={new Set(blocks.map((block) => block.type))}
					clipboardLabel={
						clipboard
							? `${blockDefinitionMap.get(clipboard.block.type)?.label} · copiado de ${clipboard.from}`
							: null
					}
					onPick={(def) => insertBlock({ id: newBlockId(), type: def.type, data: {} })}
					onPaste={pasteBlock}
				/>
			</AdminModal>

			<AdminModal
				open={versionsOpen}
				onClose={() => setVersionsOpen(false)}
				title="Histórico de publicações"
				size="lg"
			>
				{versions === null ? (
					<p className="mb-0">A carregar...</p>
				) : versions.length === 0 ? (
					<p className="mb-0">Ainda não há publicações desta página.</p>
				) : (
					<>
						<p className="admin-help">
							Restaurar carrega a versão no editor. O site só muda quando publicar.
						</p>
						<ul className="pb-versions">
							{versions.map((version, index) => (
								<li key={version.id}>
									<div>
										<strong>{dateFormat.format(new Date(version.createdAt))}</strong>
										{index === 0 ? <span className="admin-badge admin-badge-success ms-2">No site</span> : null}
										<p className="admin-help mb-0">
											{version.author ?? "—"} · {version.blockCount} blocos
										</p>
									</div>
									<button
										type="button"
										className="admin-btn admin-btn-outline admin-btn-sm"
										onClick={() => restoreVersion(version)}
										disabled={pending}
									>
										Restaurar
									</button>
								</li>
							))}
						</ul>
					</>
				)}
			</AdminModal>

			<AdminModal
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				title="Remover bloco?"
				footer={
					<>
						<button type="button" className="admin-btn admin-btn-outline" onClick={() => setDeleteTarget(null)}>
							Cancelar
						</button>
						<button
							type="button"
							className="admin-btn admin-btn-danger"
							onClick={() => {
								setBlocks((current) => current.filter((block) => block.id !== deleteTarget?.id));
								setDeleteTarget(null);
							}}
						>
							Remover
						</button>
					</>
				}
			>
				<p className="mb-0">
					O bloco &quot;{deleteTarget ? blockDefinitionMap.get(deleteTarget.type)?.label : ""}&quot; sai
					da página. Pode desfazer com Ctrl+Z; só fica definitivo quando guardar ou publicar.
				</p>
			</AdminModal>

			<AdminModal
				open={confirm !== null}
				onClose={() => setConfirm(null)}
				title={confirm === "reset" ? "Repor layout padrão?" : "Descartar alterações?"}
				footer={
					<>
						<button type="button" className="admin-btn admin-btn-outline" onClick={() => setConfirm(null)}>
							Cancelar
						</button>
						<button
							type="button"
							className="admin-btn admin-btn-danger"
							onClick={confirm === "reset" ? resetToDefault : discard}
							disabled={pending}
						>
							{confirm === "reset" ? "Repor" : "Descartar"}
						</button>
					</>
				}
			>
				<p className="mb-0">
					{confirm === "reset"
						? "Os blocos voltam à configuração original do site, com os textos padrão. O site só muda quando publicar."
						: "O editor volta à versão publicada. As alterações não publicadas perdem-se."}
				</p>
			</AdminModal>
		</div>
	);
}

const hideOnOptions: { value: "" | "mobile" | "desktop"; label: string }[] = [
	{ value: "", label: "Visível em todos os ecrãs" },
	{ value: "mobile", label: "Esconder no telemóvel" },
	{ value: "desktop", label: "Esconder no computador" },
];

function SortableBlock({
	block,
	pagePath,
	expanded,
	onToggle,
	onHide,
	onDuplicate,
	onCopy,
	onDelete,
	onInsertBelow,
	onData,
	onSettings,
}: {
	block: PageBlock;
	pagePath: string;
	expanded: boolean;
	onToggle: () => void;
	onHide: () => void;
	onDuplicate: () => void;
	onCopy: () => void;
	onDelete: () => void;
	onInsertBelow: () => void;
	onData: (name: string, value: BlockValue) => void;
	onSettings: (settings: PageBlockSettings, key: string) => void;
}) {
	const def = blockDefinitionMap.get(block.type);
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
		useSortable({ id: block.id });

	if (!def) return null;

	const hideOn = block.settings?.hideOn;
	const anchor = block.settings?.anchor ?? "";
	const anchorInvalid = anchor !== "" && !ANCHOR_PATTERN.test(anchor);

	return (
		<li
			id={`pb-block-${block.id}`}
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={`pb-block${isDragging ? " is-dragging" : ""}${block.hidden ? " is-hidden" : ""}${
				expanded ? " is-expanded" : ""
			}`}
		>
			<div className="pb-block-head">
				<button
					type="button"
					ref={setActivatorNodeRef}
					className="pb-drag"
					title="Arrastar para reordenar"
					{...attributes}
					{...listeners}
				>
					<i className="ph ph-dots-six-vertical" aria-hidden />
				</button>
				<button type="button" className="pb-block-title" onClick={onToggle} aria-expanded={expanded}>
					<i className={`ph ${def.icon}`} aria-hidden />
					<span>
						<strong>{def.label}</strong>
						<small>{blockSummary(block, def)}</small>
					</span>
					{block.hidden ? <span className="admin-badge admin-badge-muted">Oculto</span> : null}
					{hideOn ? (
						<i
							className={`ph ${hideOn === "mobile" ? "ph-desktop" : "ph-device-mobile"} pb-flag`}
							title={hideOn === "mobile" ? "Só no computador" : "Só no telemóvel"}
							aria-hidden
						/>
					) : null}
					{anchor ? <span className="pb-anchor-tag">#{anchor}</span> : null}
				</button>
				<div className="pb-icon-actions">
					<button type="button" title={block.hidden ? "Mostrar" : "Ocultar"} onClick={onHide}>
						<i className={`ph ${block.hidden ? "ph-eye-slash" : "ph-eye"}`} aria-hidden />
					</button>
					<button type="button" title="Duplicar" onClick={onDuplicate}>
						<i className="ph ph-copy-simple" aria-hidden />
					</button>
					<button type="button" title="Copiar para outra página" onClick={onCopy}>
						<i className="ph ph-clipboard" aria-hidden />
					</button>
					<button type="button" title="Inserir bloco abaixo" onClick={onInsertBelow}>
						<i className="ph ph-plus" aria-hidden />
					</button>
					<button type="button" title="Remover" className="is-danger" onClick={onDelete}>
						<i className="ph ph-trash" aria-hidden />
					</button>
					<button type="button" title={expanded ? "Fechar" : "Editar"} onClick={onToggle}>
						<i className={`ph ${expanded ? "ph-caret-up" : "ph-caret-down"}`} aria-hidden />
					</button>
				</div>
			</div>

			{expanded ? (
				<div className="pb-block-body">
					<BlockFields fields={def.fields} values={block.data} onChange={onData} />
					{def.lists?.map((list) => (
						<BlockList
							key={list.name}
							list={list}
							items={block.data[list.name] as Record<string, BlockValue>[] | undefined}
							onChange={(items) => onData(list.name, items as BlockValue)}
						/>
					))}
					{!def.fields.length && !def.lists?.length ? (
						<p className="admin-help mb-0">Este bloco não tem opções de conteúdo.</p>
					) : null}

					<details className="pb-advanced" open={Boolean(hideOn || anchor)}>
						<summary>
							<i className="ph ph-sliders-horizontal" aria-hidden /> Opções avançadas
						</summary>
						<div className="pb-fields">
							<div>
								<label className="admin-label" htmlFor={`hide-${block.id}`}>
									Visibilidade
								</label>
								<select
									id={`hide-${block.id}`}
									className="admin-input form-select"
									value={hideOn ?? ""}
									onChange={(event) =>
										onSettings(
											{ hideOn: (event.target.value || undefined) as PageBlockSettings["hideOn"] },
											"hideOn"
										)
									}
								>
									{hideOnOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="admin-label" htmlFor={`anchor-${block.id}`}>
									Âncora
								</label>
								<input
									id={`anchor-${block.id}`}
									className={`admin-input form-control${anchorInvalid ? " admin-input-error" : ""}`}
									value={anchor}
									placeholder="ex.: inscricoes"
									onChange={(event) =>
										onSettings({ anchor: event.target.value.toLowerCase() || undefined }, "anchor")
									}
								/>
								<p className={`admin-help${anchorInvalid ? " text-danger" : ""}`}>
									{anchorInvalid
										? "Use só letras minúsculas, números e hífens."
										: `Link directo: ${pagePath}#${anchor || "..."}`}
								</p>
							</div>
						</div>
					</details>
				</div>
			) : null}
		</li>
	);
}

const DESKTOP_WIDTH = 1280;

function Preview({
	slug,
	path,
	device,
	onDevice,
	iframeRef,
}: {
	slug: string;
	path: string;
	device: "desktop" | "mobile";
	onDevice: (device: "desktop" | "mobile") => void;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
}) {
	const frameRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0.5);
	const [reloadKey, setReloadKey] = useState(0);

	// A versão desktop é desenhada a 1280px e reduzida para caber na coluna.
	useEffect(() => {
		const element = frameRef.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => {
			setScale(Math.min(1, entry.contentRect.width / DESKTOP_WIDTH));
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const desktop = device === "desktop";

	return (
		<aside className="pb-preview">
			<div className="pb-preview-bar">
				<strong>
					<span className="pb-live-dot" aria-hidden /> Pré-visualização ao vivo
				</strong>
				<div className="d-flex align-items-center gap-2">
					<div className="pb-locale-switch" role="tablist" aria-label="Dispositivo">
						<button
							type="button"
							className={desktop ? "is-active" : undefined}
							onClick={() => onDevice("desktop")}
							title="Computador"
						>
							<i className="ph ph-desktop" aria-hidden />
						</button>
						<button
							type="button"
							className={!desktop ? "is-active" : undefined}
							onClick={() => onDevice("mobile")}
							title="Telemóvel"
						>
							<i className="ph ph-device-mobile" aria-hidden />
						</button>
					</div>
					<button
						type="button"
						className="admin-btn admin-btn-ghost admin-btn-sm"
						title="Recarregar pré-visualização"
						onClick={() => setReloadKey((value) => value + 1)}
					>
						<i className="ph ph-arrows-clockwise" aria-hidden />
					</button>
					<Link href={path} target="_blank" className="admin-btn admin-btn-ghost admin-btn-sm">
						<i className="ph ph-arrow-square-out" aria-hidden /> Site
					</Link>
				</div>
			</div>
			<div ref={frameRef} className={`pb-preview-frame${desktop ? "" : " is-mobile"}`}>
				<div
					className="pb-preview-canvas"
					style={
						desktop
							? { width: DESKTOP_WIDTH, height: `${100 / scale}%`, transform: `scale(${scale})` }
							: undefined
					}
				>
					<iframe
						key={reloadKey}
						ref={iframeRef}
						src={`/pre-visualizar/${slug}`}
						title="Pré-visualização da página"
					/>
				</div>
			</div>
		</aside>
	);
}

"use client";

import { useMemo, useState } from "react";
import { blockDefinitionMap, blockDefinitions, paletteGroups, type BlockDef } from "@/lib/page-blocks";
import { normalizeSearch } from "@/lib/search";

type Tab = "suggested" | "all" | string;

// Janela "Adicionar bloco": menu de categorias à esquerda e lista compacta com scroll à direita,
// para caber no ecrã mesmo com muitos tipos de bloco.
export default function BlockPicker({
	suggested,
	usedTypes,
	clipboardLabel,
	onPick,
	onPaste,
}: {
	suggested: string[];
	usedTypes: Set<string>;
	clipboardLabel: string | null;
	onPick: (def: BlockDef) => void;
	onPaste: () => void;
}) {
	const [tab, setTab] = useState<Tab>("suggested");
	const [query, setQuery] = useState("");

	const tabs = useMemo(
		() => [
			{ id: "suggested", label: "Sugeridos", icon: "ph-sparkle", types: suggested },
			{ id: "all", label: "Todos", icon: "ph-squares-four", types: blockDefinitions.map((def) => def.type) },
			...paletteGroups.map((group) => ({ id: group.label, label: group.label, icon: "", types: group.types })),
		],
		[suggested]
	);

	// Sem acentos: "video" encontra "Vídeo".
	const needle = normalizeSearch(query);
	const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0];
	const types = needle ? tabs[1].types : activeTab.types;
	const defs = types
		.map((type) => blockDefinitionMap.get(type))
		.filter((def): def is BlockDef => Boolean(def))
		.filter((def) => !needle || normalizeSearch(`${def.label} ${def.description}`).includes(needle));

	return (
		<div className="pb-picker">
			<div className="pb-picker-search">
				<i className="ph ph-magnifying-glass" aria-hidden />
				<input
					autoFocus
					className="admin-input form-control"
					placeholder="Procurar bloco (ex.: vídeo, perguntas, logótipos)"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
			</div>

			<nav className="pb-picker-tabs" aria-label="Categorias de blocos">
				{tabs.map((item) => (
					<button
						key={item.id}
						type="button"
						className={!needle && tab === item.id ? "is-active" : undefined}
						onClick={() => {
							setTab(item.id);
							setQuery("");
						}}
					>
						{item.icon ? <i className={`ph ${item.icon}`} aria-hidden /> : null}
						<span>{item.label}</span>
						<small>{item.types.length}</small>
					</button>
				))}
			</nav>

			<div className="pb-picker-list">
				{needle ? (
					<p className="pb-picker-caption">
						{defs.length ? `${defs.length} resultado(s) para "${query.trim()}"` : `Nenhum bloco para "${query.trim()}".`}
					</p>
				) : (
					<p className="pb-picker-caption">
						{tab === "suggested" ? "Blocos que costumam funcionar bem nesta página." : activeTab.label}
					</p>
				)}

				{clipboardLabel && !needle && tab === "suggested" ? (
					<button type="button" className="pb-picker-item is-paste" onClick={onPaste}>
						<span className="pb-picker-icon">
							<i className="ph ph-clipboard-text" aria-hidden />
						</span>
						<span className="pb-picker-text">
							<strong>Colar bloco copiado</strong>
							<small>{clipboardLabel}</small>
						</span>
					</button>
				) : null}

				{defs.map((def) => (
					<button key={def.type} type="button" className="pb-picker-item" onClick={() => onPick(def)}>
						<span className="pb-picker-icon">
							<i className={`ph ${def.icon}`} aria-hidden />
						</span>
						<span className="pb-picker-text">
							<strong>
								{def.label}
								{usedTypes.has(def.type) ? <em>já na página</em> : null}
							</strong>
							<small>{def.description}</small>
						</span>
						<i className="ph ph-plus pb-picker-add" aria-hidden />
					</button>
				))}
			</div>
		</div>
	);
}

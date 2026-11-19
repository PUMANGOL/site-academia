"use client";

import { useEffect, useState } from "react";
import type { PageBlock } from "@/db/schema";
import { blockDefinitionMap } from "@/lib/page-blocks";
import { BlockShell, RenderBlock, type PageBlocksData } from "./page-blocks";

// Mensagens trocadas com o editor de páginas (iframe <-> backoffice, sempre na mesma origem).
export type PreviewMessage =
	| { source: "pb-editor"; type: "blocks"; blocks: PageBlock[] }
	| { source: "pb-editor"; type: "focus"; id: string }
	| { source: "pb-preview"; type: "ready" }
	| { source: "pb-preview"; type: "select"; id: string };

function post(message: PreviewMessage) {
	window.parent?.postMessage(message, window.location.origin);
}

export default function LivePreview({
	initialBlocks,
	...data
}: { initialBlocks: PageBlock[] } & PageBlocksData) {
	const [blocks, setBlocks] = useState(initialBlocks);
	const [focused, setFocused] = useState<string | null>(null);

	useEffect(() => {
		function onMessage(event: MessageEvent<PreviewMessage>) {
			if (event.origin !== window.location.origin || event.data?.source !== "pb-editor") return;
			if (event.data.type === "blocks") setBlocks(event.data.blocks);
			if (event.data.type === "focus") {
				const { id } = event.data;
				setFocused(id);
				document
					.querySelector(`[data-block-id="${CSS.escape(id)}"]`)
					?.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
		window.addEventListener("message", onMessage);
		post({ source: "pb-preview", type: "ready" });
		return () => window.removeEventListener("message", onMessage);
	}, []);

	useEffect(() => {
		if (!focused) return;
		const timer = window.setTimeout(() => setFocused(null), 1600);
		return () => window.clearTimeout(timer);
	}, [focused]);

	const visible = blocks.filter((block) => !block.hidden);

	return (
		<div className="pb-live">
			{visible.map((block, index) => (
				<BlockShell
					key={block.id}
					block={block}
					data-block-id={block.id}
					data-focused={focused === block.id ? "" : undefined}
				>
					<button
						type="button"
						className="pb-live-edit"
						onClick={() => post({ source: "pb-preview", type: "select", id: block.id })}
					>
						<i className="ph ph-pencil-simple" aria-hidden />
						{blockDefinitionMap.get(block.type)?.label ?? block.type}
					</button>
					<RenderBlock block={block} index={index} {...data} />
				</BlockShell>
			))}
			{visible.length === 0 ? (
				<p className="pb-live-empty">A página não tem blocos visíveis.</p>
			) : null}
		</div>
	);
}

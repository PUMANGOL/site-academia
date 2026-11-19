import type { ReactNode } from "react";
import type { RichTextDoc, RichTextNode } from "@/db/schema";

// Renderiza o JSON do editor Tiptap directamente em React. Só os nós e marcas
// conhecidos são desenhados, por isso não há HTML arbitrário a chegar ao site.

function safeHref(value: unknown) {
	if (typeof value !== "string") return null;
	const href = value.trim();
	if (/^(https?:|mailto:|tel:)/i.test(href) || href.startsWith("/") || href.startsWith("#")) {
		return href;
	}
	return null;
}

function safeSrc(value: unknown) {
	if (typeof value !== "string") return null;
	const src = value.trim();
	if (/^https:\/\//i.test(src) || src.startsWith("/")) return src;
	return null;
}

function renderText(node: RichTextNode, key: number): ReactNode {
	let element: ReactNode = node.text ?? "";
	for (const mark of node.marks ?? []) {
		switch (mark.type) {
			case "bold":
				element = <strong>{element}</strong>;
				break;
			case "italic":
				element = <em>{element}</em>;
				break;
			case "underline":
				element = <u>{element}</u>;
				break;
			case "strike":
				element = <s>{element}</s>;
				break;
			case "code":
				element = <code>{element}</code>;
				break;
			case "link": {
				const href = safeHref(mark.attrs?.href);
				if (href) {
					const external = /^https?:/i.test(href);
					element = (
						<a
							href={href}
							{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
						>
							{element}
						</a>
					);
				}
				break;
			}
		}
	}
	return <span key={key}>{element}</span>;
}

function renderChildren(node: RichTextNode) {
	return (node.content ?? []).map((child, index) => renderNode(child, index));
}

function renderNode(node: RichTextNode, key: number): ReactNode {
	switch (node.type) {
		case "text":
			return renderText(node, key);
		case "paragraph":
			return <p key={key}>{renderChildren(node)}</p>;
		case "heading": {
			const level = Number(node.attrs?.level);
			const Tag = level === 3 ? "h3" : level === 4 ? "h4" : "h2";
			return <Tag key={key}>{renderChildren(node)}</Tag>;
		}
		case "bulletList":
			return <ul key={key}>{renderChildren(node)}</ul>;
		case "orderedList":
			return <ol key={key}>{renderChildren(node)}</ol>;
		case "listItem":
			return <li key={key}>{renderChildren(node)}</li>;
		case "blockquote":
			return <blockquote key={key}>{renderChildren(node)}</blockquote>;
		case "codeBlock":
			return (
				<pre key={key}>
					<code>{renderChildren(node)}</code>
				</pre>
			);
		case "horizontalRule":
			return <hr key={key} />;
		case "hardBreak":
			return <br key={key} />;
		case "image": {
			const src = safeSrc(node.attrs?.src);
			if (!src) return null;
			const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
			// eslint-disable-next-line @next/next/no-img-element
			return <img key={key} src={src} alt={alt} loading="lazy" />;
		}
		default:
			return null;
	}
}

export function isRichTextEmpty(doc: RichTextDoc | null | undefined) {
	if (!doc?.content?.length) return true;
	return doc.content.every(
		(node) => node.type === "paragraph" && !node.content?.length
	);
}

export default function RichText({
	doc,
	className = "rich-text",
}: {
	doc: RichTextDoc | null | undefined;
	className?: string;
}) {
	if (isRichTextEmpty(doc)) return null;
	return <div className={className}>{renderChildren(doc!)}</div>;
}

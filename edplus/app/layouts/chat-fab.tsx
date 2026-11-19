"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/i18n/I18nProvider";
import { isAuthPath } from "@/lib/auth-paths";

const USER_KEY = "academia-chat-user";
const THREAD_KEY = "academia-chat-thread";

type Role = "user" | "assistant";

type ChatMessage = {
	id: string;
	role: Role;
	text: string;
};

type StreamEvent = {
	delta?: string;
	replace?: string;
	conversationId?: string;
	event?: string;
	error?: string;
};

const AVATAR = "/assets/img/pumuki-chat.jpg";

const SUGGESTIONS = [
	{ title: "chat.s1", hint: "chat.s1hint", query: "chat.s1q" },
	{ title: "chat.s2", hint: "chat.s2hint", query: "chat.s2q" },
	{ title: "chat.s3", hint: "chat.s3hint", query: "chat.s3q" },
	{ title: "chat.s4", hint: "chat.s4hint", query: "chat.s4q" },
] as const;

function chatUserId() {
	const existing = localStorage.getItem(USER_KEY);
	if (existing) return existing;
	const created = crypto.randomUUID();
	localStorage.setItem(USER_KEY, created);
	return created;
}

function renderInline(line: string): ReactNode[] {
	const pattern = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))|(https?:\/\/[^\s)]+)/g;
	const nodes: ReactNode[] = [];
	let cursor = 0;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(line))) {
		if (match.index > cursor) nodes.push(line.slice(cursor, match.index));
		const token = match[0];
		if (token.startsWith("**")) {
			nodes.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
		} else if (token.startsWith("[")) {
			const label = token.slice(1, token.indexOf("]"));
			const href = token.slice(token.indexOf("(") + 1, -1);
			nodes.push(
				<a key={match.index} href={href} target={href.startsWith("/") ? undefined : "_blank"} rel={href.startsWith("/") ? undefined : "noreferrer"}>
					{label}
				</a>
			);
		} else {
			nodes.push(
				<a key={match.index} href={token} target="_blank" rel="noreferrer">
					{token}
				</a>
			);
		}
		cursor = match.index + token.length;
	}
	if (cursor < line.length) nodes.push(line.slice(cursor));
	return nodes;
}

function ChatBubble({ role, children }: { role: Role; children: ReactNode }) {
	const isUser = role === "user";
	return (
		<div className={`ap-chat-row ${isUser ? "is-user" : "is-bot"}`}>
			{isUser ? null : <img src={AVATAR} alt="" className="ap-chat-face" width={64} height={64} />}
			<div className={`ap-chat-msg ${isUser ? "is-user" : "is-bot"}`}>{children}</div>
			{isUser ? (
				<span className="ap-chat-face is-user" aria-hidden>
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
						<circle cx="12" cy="7.5" r="4" fill="currentColor" />
						<path fill="currentColor" d="M4.2 20.5c.9-4.1 3.9-6.2 7.8-6.2s6.9 2.1 7.8 6.2H4.2z" />
					</svg>
				</span>
			) : null}
		</div>
	);
}

function MessageText({ text }: { text: string }) {
	const paragraphs = text.split(/\n{2,}/);
	return paragraphs.map((paragraph, index) => (
		<p key={index}>
			{paragraph.split("\n").map((line, lineIndex) => (
				<span key={lineIndex}>
					{lineIndex > 0 ? <br /> : null}
					{renderInline(line)}
				</span>
			))}
		</p>
	));
}

export default function ChatFab() {
	const pathname = usePathname();
	const { t } = useI18n();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [conversationId, setConversationId] = useState("");
	const [pending, setPending] = useState(false);
	const [ready, setReady] = useState(false);
	const panel = useRef<HTMLDivElement>(null);
	const log = useRef<HTMLDivElement>(null);
	const field = useRef<HTMLTextAreaElement>(null);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		try {
			const saved = sessionStorage.getItem(THREAD_KEY);
			if (saved) {
				const parsed = JSON.parse(saved) as { conversationId?: string; messages?: ChatMessage[] };
				if (Array.isArray(parsed.messages)) setMessages(parsed.messages.filter((item) => item.text));
				if (typeof parsed.conversationId === "string") setConversationId(parsed.conversationId);
			}
		} catch {
			sessionStorage.removeItem(THREAD_KEY);
		}
		setReady(true);
	}, []);

	useEffect(() => {
		if (!ready) return;
		sessionStorage.setItem(THREAD_KEY, JSON.stringify({ conversationId, messages }));
	}, [conversationId, messages, ready]);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!open) return;
		field.current?.focus();
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		const onClick = (event: MouseEvent) => {
			if (panel.current && !panel.current.contains(event.target as Node)) setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("mousedown", onClick);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("mousedown", onClick);
		};
	}, [open]);

	useEffect(() => {
		const box = log.current;
		if (!box || messages.length === 0) return;
		box.scrollTop = box.scrollHeight;
	}, [messages, pending, open]);

	useEffect(() => {
		return () => abortRef.current?.abort();
	}, []);

	async function ask(text: string, currentConversation = conversationId, retry = false) {
		const question = text.trim();
		if (!question || pending) return;

		const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: question };
		const assistantId = crypto.randomUUID();
		setMessages((current) => [...current, userMessage, { id: assistantId, role: "assistant", text: "" }]);
		setDraft("");
		setPending(true);

		const controller = new AbortController();
		abortRef.current = controller;
		let nextConversation = currentConversation;
		let handedOff = false;

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query: question,
					conversationId: currentConversation,
					userId: chatUserId(),
				}),
				signal: controller.signal,
			});

			if (response.status === 404 && currentConversation && !retry) {
				handedOff = true;
				setConversationId("");
				setMessages((current) => current.filter((item) => item.id !== userMessage.id && item.id !== assistantId));
				await ask(question, "", true);
				return;
			}

			const contentType = response.headers.get("content-type") ?? "";
			if (response.ok && contentType.includes("text/event-stream") && response.body) {
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const chunks = buffer.split("\n\n");
					buffer = chunks.pop() ?? "";
					for (const chunk of chunks) {
						const line = chunk.split("\n").find((item) => item.startsWith("data:"));
						if (!line) continue;
						let event: StreamEvent;
						try {
							event = JSON.parse(line.slice(5).trim()) as StreamEvent;
						} catch {
							continue;
						}
						if (event.conversationId) {
							nextConversation = event.conversationId;
							setConversationId(event.conversationId);
						}
						if (event.error) continue;
						if (event.replace != null || event.delta) {
							setMessages((current) =>
								current.map((item) => {
									if (item.id !== assistantId) return item;
									return {
										...item,
										text: event.replace != null ? event.replace : item.text + (event.delta ?? ""),
									};
								})
							);
						}
					}
				}
			}
		} catch (error) {
			if ((error as { name?: string }).name === "AbortError") return;
		} finally {
			if (!handedOff && controller.signal.aborted === false) {
				setPending(false);
				setMessages((current) =>
					current.map((item) => {
						if (item.id !== assistantId) return item;
						if (!item.text.trim()) return { ...item, text: t("chat.error") };
						return item;
					})
				);
				if (nextConversation) setConversationId(nextConversation);
			}
			if (field.current) field.current.style.height = "auto";
		}
	}

	function startOver() {
		abortRef.current?.abort();
		setMessages([]);
		setConversationId("");
		setDraft("");
		setPending(false);
		field.current?.focus();
	}

	if (pathname?.startsWith("/backoffice") || isAuthPath(pathname)) return null;

	return (
		<div className="ap-chat" ref={panel}>
			{open ? (
				<div className="ap-chat-panel" role="dialog" aria-label={t("chat.title")}>
					<div className="ap-chat-head">
						<img src={AVATAR} alt="" className="ap-chat-avatar" width={104} height={104} />
						<div className="ap-chat-id">
							<strong>{t("chat.title")}</strong>
							<span>{t("chat.subtitle")}</span>
						</div>
						<button type="button" className="ap-chat-icon" onClick={startOver} aria-label={t("chat.newChat")}>
							<i className="ph ph-arrow-clockwise" aria-hidden />
						</button>
						<button type="button" className="ap-chat-icon" onClick={() => setOpen(false)} aria-label={t("chat.close")}>
							<i className="ph ph-x" aria-hidden />
						</button>
					</div>
					<div className="ap-chat-log" ref={log} aria-live="polite">
						<ChatBubble role="assistant">
							<MessageText text={t("chat.welcome")} />
						</ChatBubble>
						{messages.length === 0 ? (
							<div className="ap-chat-suggestions" aria-label={t("chat.suggestionsLabel")}>
								{SUGGESTIONS.map((item) => (
									<button key={item.query} type="button" onClick={() => void ask(t(item.query))} disabled={pending}>
										<strong>{t(item.title)}</strong>
										<span>{t(item.hint)}</span>
									</button>
								))}
							</div>
						) : null}
						{messages.map((message) =>
							message.role === "assistant" && !message.text ? (
								<div key={message.id} className="ap-chat-row is-bot is-thinking">
									<img src={AVATAR} alt="" className="ap-chat-face" width={64} height={64} />
									<span className="ap-chat-dots" aria-label={t("chat.thinking")} />
								</div>
							) : (
								<ChatBubble key={message.id} role={message.role}>
									<MessageText text={message.text} />
								</ChatBubble>
							)
						)}
					</div>
					<form
						className="ap-chat-form"
						onSubmit={(event) => {
							event.preventDefault();
							void ask(draft);
						}}
					>
						<textarea
							ref={field}
							rows={1}
							value={draft}
							placeholder={t("chat.placeholder")}
							aria-label={t("chat.placeholder")}
							onChange={(event) => {
								setDraft(event.target.value);
								event.target.style.height = "auto";
								event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
							}}
							onKeyDown={(event) => {
								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									void ask(draft);
								}
							}}
						/>
						<button type="submit" aria-label={t("chat.send")} disabled={pending || !draft.trim()}>
							<i className="ph ph-paper-plane-right" aria-hidden />
						</button>
					</form>
					<p className="ap-chat-human">
						<Link href="/contact">{t("chat.human")}</Link>
					</p>
				</div>
			) : null}
			<button
				type="button"
				className={`ap-chat-fab${open ? "" : " ap-pulse"}`}
				aria-label={t("chat.open")}
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
			>
				<img src={AVATAR} alt="" width={152} height={152} />
			</button>
		</div>
	);
}

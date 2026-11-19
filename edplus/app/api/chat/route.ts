const MAX_QUERY = 2000;

type ChatBody = {
	query?: unknown;
	conversationId?: unknown;
	userId?: unknown;
};

function jsonError(error: "invalid" | "unavailable" | "conversation" | "upstream", status: number) {
	return Response.json({ error }, { status });
}

function asId(value: unknown, pattern: RegExp) {
	return typeof value === "string" && pattern.test(value) ? value : "";
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
	const apiKey = process.env.DIFY_API_KEY;
	const apiUrl = process.env.DIFY_API_URL?.replace(/\/$/, "");
	if (!apiKey || !apiUrl) return jsonError("unavailable", 503);

	let body: ChatBody;
	try {
		body = (await request.json()) as ChatBody;
	} catch {
		return jsonError("invalid", 400);
	}

	const query = typeof body.query === "string" ? body.query.trim() : "";
	if (!query || query.length > MAX_QUERY) return jsonError("invalid", 400);

	const userId = asId(body.userId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
	const conversationId = asId(
		body.conversationId,
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
	);
	if (!userId) return jsonError("invalid", 400);

	let upstream: Response;
	try {
		upstream = await fetch(`${apiUrl}/chat-messages`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				inputs: {},
				query,
				response_mode: "streaming",
				conversation_id: conversationId,
				user: userId,
			}),
			signal: AbortSignal.any([request.signal, AbortSignal.timeout(55_000)]),
		});
	} catch {
		return jsonError("upstream", 502);
	}

	if (upstream.status === 404) return jsonError("conversation", 404);
	if (!upstream.ok || !upstream.body) return jsonError("upstream", 502);

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const stream = new ReadableStream({
		async start(controller) {
			const reader = upstream.body!.getReader();
			let buffer = "";
			const send = (payload: unknown) => {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
			};

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() ?? "";
					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed.startsWith("data:")) continue;
						const raw = trimmed.slice(5).trim();
						if (!raw || raw === "[DONE]") continue;
						let event: { event?: string; answer?: string; conversation_id?: string };
						try {
							event = JSON.parse(raw) as typeof event;
						} catch {
							continue;
						}
						const conversation = typeof event.conversation_id === "string" ? event.conversation_id : undefined;
						if (event.event === "message" || event.event === "agent_message") {
							if (event.answer) send({ delta: event.answer, conversationId: conversation });
						} else if (event.event === "message_replace") {
							send({ replace: event.answer ?? "", conversationId: conversation });
						} else if (event.event === "message_end") {
							send({ event: "end", conversationId: conversation });
						} else if (event.event === "error") {
							send({ error: "upstream" });
						}
					}
				}
				send({ event: "end" });
			} catch {
				send({ error: "upstream" });
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache, no-transform",
			"X-Accel-Buffering": "no",
		},
	});
}

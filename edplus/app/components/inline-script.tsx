"use client";

// Script em linha que o browser executa ao ler o HTML do servidor, antes da primeira pintura.
// Quando o React desenha o elemento no browser (página de erro, recarga a quente), o script nunca corre:
// por isso, desse lado, fica "text/plain" e o React deixa de avisar sobre uma tag <script> no componente.
// Padrão do guia "Preventing flash before hydration" do Next 16.
export function InlineScript({ html }: { html: string }) {
	return (
		<script
			type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
			suppressHydrationWarning
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

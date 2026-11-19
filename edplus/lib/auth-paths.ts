// Páginas de autenticação: só navbar + cartão (sem hero, rodapé nem botão de voltar ao topo).
export const AUTH_PATHS = ["/login", "/register", "/recuperar-password", "/redefinir-password"];

export function isAuthPath(pathname: string | null) {
	return pathname !== null && AUTH_PATHS.includes(pathname);
}

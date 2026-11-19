import { NextRequest, NextResponse } from "next/server";

const PUBLIC_BACKOFFICE = ["/backoffice/login"];

function getSessionToken(request: NextRequest) {
	return (
		request.cookies.get("better-auth.session_token")?.value ??
		request.cookies.get("__Secure-better-auth.session_token")?.value
	);
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith("/backoffice")) {
		if (PUBLIC_BACKOFFICE.some((route) => pathname.startsWith(route))) {
			return NextResponse.next();
		}

		if (!getSessionToken(request)) {
			const loginUrl = new URL("/backoffice/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(loginUrl);
		}

		return NextResponse.next();
	}

	if (pathname.startsWith("/aluno")) {
		if (!getSessionToken(request)) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(loginUrl);
		}

		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/backoffice/:path*", "/aluno/:path*"],
};

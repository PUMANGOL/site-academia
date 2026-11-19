export function siteUrl(path = "/") {
	const base = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
	return `${base}${path}`;
}

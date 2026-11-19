import { redirect } from "next/navigation";

export default async function CoursesPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string | string[] }>;
}) {
	const { q } = await searchParams;
	const query = Array.isArray(q) ? q[0] : q;
	redirect(query ? `/catalogo?q=${encodeURIComponent(query)}` : "/catalogo");
}

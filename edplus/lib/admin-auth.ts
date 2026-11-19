import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { UserRole } from "@/lib/roles";
import { getServerSession } from "@/lib/session";

export async function getAdminSession() {
	const session = await getServerSession();
	if (!session?.user) return null;

	const [record] = await db
		.select({ role: user.role })
		.from(user)
		.where(eq(user.id, session.user.id))
		.limit(1);

	if (!record || record.role !== "admin") return null;

	return { ...session, user: { ...session.user, role: record.role as UserRole } };
}

export async function requireAdmin() {
	const session = await getAdminSession();
	if (!session) {
		redirect("/backoffice/login");
	}
	return session;
}

export async function requireUser() {
	const session = await getServerSession();
	if (!session?.user) {
		redirect("/login");
	}
	return session;
}

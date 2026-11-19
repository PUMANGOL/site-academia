"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getAdminSession } from "@/lib/admin-auth";
import type { UserRole } from "@/lib/roles";

async function assertAdmin() {
	const session = await getAdminSession();
	if (!session) throw new Error("Não autorizado.");
	return session;
}

export async function updateUserRole(userId: string, role: UserRole) {
	try {
		const session = await assertAdmin();
		if (session.user.id === userId && role !== "admin") {
			return {
				ok: false as const,
				error: "Não pode remover o seu próprio acesso de administrador.",
			};
		}

		await db.update(user).set({ role }).where(eq(user.id, userId));
		revalidatePath("/backoffice/utilizadores");
		return { ok: true as const };
	} catch (error) {
		console.error("updateUserRole:", error);
		return { ok: false as const, error: "Não foi possível alterar a função." };
	}
}

export async function banUser(userId: string, reason?: string) {
	try {
		const session = await assertAdmin();
		if (session.user.id === userId) {
			return { ok: false as const, error: "Não pode banir a sua própria conta." };
		}

		await auth.api.banUser({
			body: { userId, banReason: reason?.trim() || undefined },
			headers: await headers(),
		});

		revalidatePath("/backoffice/utilizadores");
		return { ok: true as const };
	} catch (error) {
		console.error("banUser:", error);
		return { ok: false as const, error: "Não foi possível banir o utilizador." };
	}
}

export async function unbanUser(userId: string) {
	try {
		await assertAdmin();

		await auth.api.unbanUser({
			body: { userId },
			headers: await headers(),
		});

		revalidatePath("/backoffice/utilizadores");
		return { ok: true as const };
	} catch (error) {
		console.error("unbanUser:", error);
		return { ok: false as const, error: "Não foi possível reativar o utilizador." };
	}
}

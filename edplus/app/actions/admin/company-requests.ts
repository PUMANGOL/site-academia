"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { companyRequests, type CompanyRequestStatus } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { reportDbError } from "@/lib/content";

const STATUSES: CompanyRequestStatus[] = ["new", "in_progress", "closed"];

export async function updateCompanyRequest(
	id: string,
	input: { status: CompanyRequestStatus; internalNotes: string }
) {
	if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false as const, error: "Pedido inválido." };
	if (!STATUSES.includes(input.status)) return { ok: false as const, error: "Estado inválido." };

	try {
		const session = await getAdminSession();
		if (!session) throw new Error("Não autorizado.");
		await db
			.update(companyRequests)
			.set({
				status: input.status,
				internalNotes: input.internalNotes.trim().slice(0, 4000) || null,
				handledBy: session.user.id,
			})
			.where(eq(companyRequests.id, id));
		revalidatePath("/backoffice/pedidos");
		return { ok: true as const };
	} catch (error) {
		return {
			ok: false as const,
			error: reportDbError("updateCompanyRequest", error, "Não foi possível actualizar o pedido."),
		};
	}
}

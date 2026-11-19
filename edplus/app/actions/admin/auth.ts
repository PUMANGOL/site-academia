"use server";

import { getAdminSession } from "@/lib/admin-auth";

export async function checkAdminAccess() {
	const session = await getAdminSession();
	return { ok: !!session };
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

async function assertAdmin() {
	const session = await getAdminSession();
	if (!session) throw new Error("Não autorizado.");
	return session;
}

export type CategoryFormInput = {
	slug: string;
	namePt: string;
	nameEn: string;
	descriptionPt?: string;
	descriptionEn?: string;
	iconUrl?: string;
	imageUrl?: string;
	sortOrder?: number;
	isActive?: boolean;
};

function toCategoryValues(input: CategoryFormInput) {
	return {
		slug: input.slug.trim(),
		name: { pt: input.namePt.trim(), en: input.nameEn.trim() },
		description: {
			pt: input.descriptionPt?.trim() ?? "",
			en: input.descriptionEn?.trim() ?? "",
		},
		iconUrl: input.iconUrl?.trim() || null,
		imageUrl: input.imageUrl?.trim() || null,
		sortOrder: input.sortOrder ?? 0,
		isActive: input.isActive ?? true,
	};
}

export async function createCategory(input: CategoryFormInput) {
	try {
		await assertAdmin();
		await db.insert(categories).values(toCategoryValues(input));
		revalidatePath("/backoffice/categorias");
		return { ok: true as const };
	} catch (error) {
		console.error("createCategory:", error);
		return { ok: false as const, error: "Não foi possível criar a categoria." };
	}
}

export async function updateCategory(id: string, input: CategoryFormInput) {
	try {
		await assertAdmin();
		await db
			.update(categories)
			.set(toCategoryValues(input))
			.where(eq(categories.id, id));
		revalidatePath("/backoffice/categorias");
		return { ok: true as const };
	} catch (error) {
		console.error("updateCategory:", error);
		return {
			ok: false as const,
			error: "Não foi possível atualizar a categoria.",
		};
	}
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
	try {
		await assertAdmin();
		await db.update(categories).set({ isActive }).where(eq(categories.id, id));
		revalidatePath("/backoffice/categorias");
		return { ok: true as const };
	} catch (error) {
		console.error("toggleCategoryActive:", error);
		return { ok: false as const, error: "Não foi possível alterar o estado." };
	}
}

export async function deleteCategory(id: string) {
	try {
		await assertAdmin();
		await db.delete(categories).where(eq(categories.id, id));
		revalidatePath("/backoffice/categorias");
		return { ok: true as const };
	} catch (error) {
		console.error("deleteCategory:", error);
		return { ok: false as const, error: "Não foi possível eliminar a categoria." };
	}
}

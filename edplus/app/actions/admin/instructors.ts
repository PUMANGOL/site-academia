"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { instructorProfiles, user } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

async function assertAdmin() {
	const session = await getAdminSession();
	if (!session) throw new Error("Não autorizado.");
	return session;
}

export type InstructorFormInput = {
	slug: string;
	name: string;
	headlinePt: string;
	headlineEn: string;
	bioPt?: string;
	bioEn?: string;
	photoUrl?: string;
	isFeatured?: boolean;
	userId?: string;
};

function toInstructorValues(input: InstructorFormInput) {
	return {
		slug: input.slug.trim(),
		name: input.name.trim(),
		headline: { pt: input.headlinePt.trim(), en: input.headlineEn.trim() },
		bio: {
			pt: input.bioPt?.trim() ?? "",
			en: input.bioEn?.trim() ?? "",
		},
		photoUrl: input.photoUrl?.trim() || null,
		isFeatured: input.isFeatured ?? false,
		userId: input.userId ?? null,
	};
}

export async function createInstructor(input: InstructorFormInput) {
	try {
		await assertAdmin();
		await db.insert(instructorProfiles).values(toInstructorValues(input));
		revalidatePath("/backoffice/instrutores");
		return { ok: true as const };
	} catch (error) {
		console.error("createInstructor:", error);
		return { ok: false as const, error: "Não foi possível criar o instrutor." };
	}
}

export async function updateInstructor(id: string, input: InstructorFormInput) {
	try {
		await assertAdmin();
		await db
			.update(instructorProfiles)
			.set(toInstructorValues(input))
			.where(eq(instructorProfiles.id, id));
		revalidatePath("/backoffice/instrutores");
		return { ok: true as const };
	} catch (error) {
		console.error("updateInstructor:", error);
		return {
			ok: false as const,
			error: "Não foi possível atualizar o instrutor.",
		};
	}
}

export async function promoteUserToInstructor(
	userId: string,
	input: InstructorFormInput
) {
	try {
		await assertAdmin();
		await db.transaction(async (tx) => {
			await tx
				.insert(instructorProfiles)
				.values(toInstructorValues({ ...input, userId }));
			await tx.update(user).set({ role: "instructor" }).where(eq(user.id, userId));
		});
		revalidatePath("/backoffice/instrutores");
		revalidatePath("/backoffice/utilizadores");
		return { ok: true as const };
	} catch (error) {
		console.error("promoteUserToInstructor:", error);
		return {
			ok: false as const,
			error: "Não foi possível promover o utilizador a instrutor.",
		};
	}
}

export async function deleteInstructor(id: string) {
	try {
		await assertAdmin();
		await db.delete(instructorProfiles).where(eq(instructorProfiles.id, id));
		revalidatePath("/backoffice/instrutores");
		return { ok: true as const };
	} catch (error) {
		console.error("deleteInstructor:", error);
		return { ok: false as const, error: "Não foi possível eliminar o instrutor." };
	}
}

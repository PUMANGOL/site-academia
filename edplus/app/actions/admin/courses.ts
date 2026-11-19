"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courseCategories, courseInstructors, courses } from "@/db/schema";
import type { CourseModality, CourseStatus, SkillLevel } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

async function assertAdmin() {
	const session = await getAdminSession();
	if (!session) throw new Error("Não autorizado.");
	return session;
}

export type CourseFormInput = {
	slug: string;
	titlePt: string;
	titleEn: string;
	excerptPt: string;
	excerptEn: string;
	descriptionPt: string;
	descriptionEn: string;
	objectivesPt: string;
	objectivesEn: string;
	imageUrl: string;
	price: string;
	skillLevel: SkillLevel;
	status: CourseStatus;
	instructorIds: string[];
	modality: CourseModality;
	durationHours: number | null;
	startDate: string | null;
	endDate: string | null;
	categoryIds: string[];
	isFeatured?: boolean;
	isFree?: boolean;
	seats: number | null;
};

function invalidSeatsMessage(seats: number | null) {
	if (seats === null) return null;
	if (!Number.isInteger(seats) || seats < 0) {
		return "Indique um número inteiro de vagas, ou deixe o campo em branco.";
	}
	return null;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateInput(input: CourseFormInput) {
	const seatsError = invalidSeatsMessage(input.seats);
	if (seatsError) return seatsError;
	if (
		input.durationHours !== null &&
		(!Number.isFinite(input.durationHours) || input.durationHours <= 0)
	) {
		return "Indique uma duração válida em horas, ou deixe o campo em branco.";
	}
	for (const value of [input.startDate, input.endDate]) {
		if (value !== null && !DATE_PATTERN.test(value)) {
			return "Indique datas válidas.";
		}
	}
	if (input.startDate && input.endDate && input.endDate < input.startDate) {
		return "A data de fim não pode ser anterior à data de início.";
	}
	if (input.modality !== "in_person" && input.modality !== "online") {
		return "Modalidade inválida.";
	}
	return null;
}

function toCourseValues(input: CourseFormInput, existingPublishedAt?: Date | null) {
	return {
		slug: input.slug.trim(),
		title: { pt: input.titlePt.trim(), en: input.titleEn.trim() },
		excerpt: { pt: input.excerptPt.trim(), en: input.excerptEn.trim() },
		description: {
			pt: input.descriptionPt.trim(),
			en: input.descriptionEn.trim(),
		},
		objectives: {
			pt: input.objectivesPt.trim(),
			en: input.objectivesEn.trim(),
		},
		imageUrl: input.imageUrl.trim(),
		price: input.price || "0",
		skillLevel: input.skillLevel,
		status: input.status,
		instructorId: input.instructorIds[0] ?? null,
		modality: input.modality,
		durationMinutes:
			input.durationHours === null ? null : Math.round(input.durationHours * 60),
		startDate: input.startDate,
		endDate: input.endDate,
		isFeatured: input.isFeatured ?? false,
		isFree: input.isFree ?? false,
		seats: input.seats,
		publishedAt:
			input.status === "published"
				? (existingPublishedAt ?? new Date())
				: null,
	};
}

async function syncCategories(courseId: string, categoryIds: string[]) {
	await db.delete(courseCategories).where(eq(courseCategories.courseId, courseId));
	if (categoryIds.length) {
		await db.insert(courseCategories).values(
			categoryIds.map((categoryId) => ({ courseId, categoryId }))
		);
	}
}

async function syncInstructors(courseId: string, instructorIds: string[]) {
	await db.delete(courseInstructors).where(eq(courseInstructors.courseId, courseId));
	if (instructorIds.length) {
		await db.insert(courseInstructors).values(
			instructorIds.map((instructorId, sortOrder) => ({
				courseId,
				instructorId,
				sortOrder,
			}))
		);
	}
}

function revalidateCatalog() {
	revalidatePath("/");
	revalidatePath("/courses", "layout");
	revalidatePath("/calendario");
	revalidatePath("/backoffice/cursos");
}

export async function createCourse(input: CourseFormInput) {
	try {
		await assertAdmin();
		const validationError = validateInput(input);
		if (validationError) {
			return { ok: false as const, error: validationError };
		}

		const [created] = await db
			.insert(courses)
			.values(toCourseValues(input))
			.returning();

		await syncCategories(created.id, input.categoryIds);
		await syncInstructors(created.id, input.instructorIds);
		revalidateCatalog();
		return { ok: true as const, id: created.id };
	} catch (error) {
		console.error("createCourse:", error);
		return { ok: false as const, error: "Não foi possível criar o curso." };
	}
}

export async function updateCourse(id: string, input: CourseFormInput) {
	try {
		await assertAdmin();
		const validationError = validateInput(input);
		if (validationError) {
			return { ok: false as const, error: validationError };
		}

		const [existing] = await db
			.select({ publishedAt: courses.publishedAt })
			.from(courses)
			.where(eq(courses.id, id))
			.limit(1);
		await db
			.update(courses)
			.set(toCourseValues(input, existing?.publishedAt))
			.where(eq(courses.id, id));
		await syncCategories(id, input.categoryIds);
		await syncInstructors(id, input.instructorIds);
		revalidateCatalog();
		revalidatePath(`/backoffice/cursos/${id}`);
		revalidatePath(`/backoffice/cursos/${id}/inscritos`);
		return { ok: true as const };
	} catch (error) {
		console.error("updateCourse:", error);
		return { ok: false as const, error: "Não foi possível atualizar o curso." };
	}
}

export async function deleteCourse(id: string) {
	try {
		await assertAdmin();
		await db.delete(courses).where(eq(courses.id, id));
		revalidatePath("/backoffice/cursos");
		return { ok: true as const };
	} catch (error) {
		console.error("deleteCourse:", error);
		return { ok: false as const, error: "Não foi possível eliminar o curso." };
	}
}

export async function updateCourseStatus(id: string, status: CourseStatus) {
	try {
		await assertAdmin();
		await db
			.update(courses)
			.set({
				status,
				publishedAt: status === "published" ? new Date() : null,
			})
			.where(eq(courses.id, id));
		revalidatePath("/backoffice/cursos");
		return { ok: true as const };
	} catch (error) {
		console.error("updateCourseStatus:", error);
		return { ok: false as const, error: "Não foi possível alterar o estado." };
	}
}

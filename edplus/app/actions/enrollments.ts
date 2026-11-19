"use server";

import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cartItems, carts, courses, enrollments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCoursePricing } from "@/lib/i18n-content";
import { enqueueEnrollmentConfirmation } from "@/lib/mail/enrollment";
import { dispatchEmails, type QueuedEmail } from "@/lib/mail/queue";

class EnrollmentError extends Error {}

export type FreeEnrollmentResult =
	| { ok: true; alreadyEnrolled: boolean; email: string }
	| { ok: false; requiresLogin?: boolean; error: string };

// Inscrição directa nos cursos gratuitos: sem encomenda nem referência de pagamento.
export async function enrollInFreeCourse(courseId: string): Promise<FreeEnrollmentResult> {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		const user = session?.user;
		if (!user) {
			return { ok: false, requiresLogin: true, error: "Inicie sessão para se inscrever." };
		}

		let queuedEmails: QueuedEmail[] = [];
		const alreadyEnrolled = await db.transaction(async (tx) => {
			// Bloqueia o curso para que duas inscrições em simultâneo não ultrapassem as vagas.
			const [course] = await tx
				.select()
				.from(courses)
				.where(eq(courses.id, courseId))
				.for("update")
				.limit(1);

			if (!course || course.status !== "published") {
				throw new EnrollmentError("Curso não encontrado.");
			}
			if (!getCoursePricing(course).isFree) {
				throw new EnrollmentError("Este curso não é gratuito: adicione-o ao carrinho.");
			}

			const [existing] = await tx
				.select({ id: enrollments.id })
				.from(enrollments)
				.where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)))
				.limit(1);
			if (existing) return true;

			if (course.seats !== null) {
				const [row] = await tx
					.select({ total: count() })
					.from(enrollments)
					.where(eq(enrollments.courseId, course.id));
				if ((row?.total ?? 0) >= course.seats) {
					throw new EnrollmentError("Este curso já não tem vagas.");
				}
			}

			const [enrollment] = await tx
				.insert(enrollments)
				.values({ userId: user.id, courseId: course.id })
				.returning({
					id: enrollments.id,
					courseId: enrollments.courseId,
					createdAt: enrollments.createdAt,
				});

			queuedEmails = await enqueueEnrollmentConfirmation(tx, {
				user,
				enrollments: [{ ...enrollment, amount: 0 }],
				payment: null,
			});

			// Se o curso tinha ficado no carrinho (antes de ser gratuito), retira-o.
			const [cart] = await tx
				.select({ id: carts.id })
				.from(carts)
				.where(eq(carts.userId, user.id))
				.limit(1);
			if (cart) {
				await tx
					.delete(cartItems)
					.where(and(eq(cartItems.cartId, cart.id), eq(cartItems.courseId, course.id)));
			}

			return false;
		});

		await dispatchEmails(queuedEmails);

		if (!alreadyEnrolled) {
			revalidatePath("/aluno");
			revalidatePath("/aluno/cursos");
			revalidatePath("/");
			revalidatePath("/courses");
			revalidatePath("/calendario");
			revalidatePath("/backoffice/cursos");
			revalidatePath(`/backoffice/cursos/${courseId}/inscritos`);
		}

		return { ok: true, alreadyEnrolled, email: user.email };
	} catch (error) {
		if (error instanceof EnrollmentError) {
			return { ok: false, error: error.message };
		}
		console.error("enrollInFreeCourse:", error);
		return { ok: false, error: "Não foi possível concluir a inscrição." };
	}
}

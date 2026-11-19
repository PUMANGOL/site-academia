"use server";

import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cartItems, carts, courses, enrollments, orderItems, orders } from "@/db/schema";
import { countCourseEnrollments, hasOpenSeats } from "@/db/queries/enrollments";
import { auth } from "@/lib/auth";
import { getCoursePricing } from "@/lib/i18n-content";
import { enqueueEnrollmentConfirmation, type NewEnrollment } from "@/lib/mail/enrollment";
import { dispatchEmails, type QueuedEmail } from "@/lib/mail/queue";

class CourseFullError extends Error {
	constructor(readonly titles: string[]) {
		super("course-full");
	}
}

const PAYMENT_ENTITY = "00306";

function generatePaymentReference() {
	let reference = "";
	for (let i = 0; i < 9; i += 1) {
		reference += Math.floor(Math.random() * 10);
	}
	return reference;
}

async function getSessionUser() {
	const session = await auth.api.getSession({ headers: await headers() });
	return session?.user ?? null;
}

export type OrderView = {
	id: string;
	status: "pending" | "paid" | "cancelled";
	total: number;
	currency: string;
	paymentEntity: string;
	paymentReference: string;
	paidAt: Date | null;
};

function toOrderView(order: typeof orders.$inferSelect): OrderView {
	return {
		id: order.id,
		status: order.status,
		total: Number(order.total),
		currency: order.currency,
		paymentEntity: order.paymentEntity,
		paymentReference: order.paymentReference,
		paidAt: order.paidAt,
	};
}

export async function createOrder() {
	try {
		const user = await getSessionUser();
		if (!user) {
			return { ok: false as const, error: "Sessão expirada. Inicie sessão novamente." };
		}

		const [cart] = await db
			.select()
			.from(carts)
			.where(eq(carts.userId, user.id))
			.limit(1);

		if (!cart) {
			return { ok: false as const, error: "O carrinho está vazio." };
		}

		const items = await db.query.cartItems.findMany({
			where: eq(cartItems.cartId, cart.id),
			with: { course: true },
		});

		if (!items.length) {
			return { ok: false as const, error: "O carrinho está vazio." };
		}

		// Cursos gratuitos não passam pelo pagamento: a inscrição é feita na página do curso.
		const freeItem = items.find((item) => getCoursePricing(item.course).isFree);
		if (freeItem) {
			return {
				ok: false as const,
				error: `O curso "${freeItem.course.title.pt}" é gratuito: remova-o do carrinho e inscreva-se directamente na página do curso.`,
			};
		}

		for (const item of items) {
			if (hasOpenSeats(item.course.seats, await countCourseEnrollments(item.courseId))) {
				continue;
			}

			const [alreadyEnrolled] = await db
				.select({ id: enrollments.id })
				.from(enrollments)
				.where(
					and(
						eq(enrollments.userId, user.id),
						eq(enrollments.courseId, item.courseId)
					)
				)
				.limit(1);

			if (!alreadyEnrolled) {
				return {
					ok: false as const,
					error: `O curso "${item.course.title.pt}" já não tem vagas.`,
				};
			}
		}

		const total = items.reduce(
			(sum, item) => sum + Number(item.unitPrice) * item.quantity,
			0
		);
		const currency = items[0]?.course.currency || "AOA";

		let reference = generatePaymentReference();
		for (let attempt = 0; attempt < 5; attempt += 1) {
			const [existing] = await db
				.select({ id: orders.id })
				.from(orders)
				.where(eq(orders.paymentReference, reference))
				.limit(1);
			if (!existing) break;
			reference = generatePaymentReference();
		}

		const [order] = await db
			.insert(orders)
			.values({
				userId: user.id,
				total: total.toFixed(2),
				currency,
				paymentEntity: PAYMENT_ENTITY,
				paymentReference: reference,
			})
			.returning();

		await db.insert(orderItems).values(
			items.map((item) => ({
				orderId: order.id,
				courseId: item.courseId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
			}))
		);

		return { ok: true as const, order: toOrderView(order) };
	} catch (error) {
		console.error("createOrder:", error);
		return { ok: false as const, error: "Não foi possível iniciar o pagamento." };
	}
}

export async function simulatePayment(orderId: string) {
	try {
		const user = await getSessionUser();
		if (!user) {
			return { ok: false as const, error: "Sessão expirada. Inicie sessão novamente." };
		}

		const [order] = await db
			.select()
			.from(orders)
			.where(eq(orders.id, orderId))
			.limit(1);

		if (!order || order.userId !== user.id) {
			return { ok: false as const, error: "Encomenda não encontrada." };
		}

		if (order.status === "paid") {
			return { ok: true as const, order: toOrderView(order) };
		}

		const items = await db
			.select()
			.from(orderItems)
			.where(eq(orderItems.orderId, order.id));

		let queuedEmails: QueuedEmail[] = [];
		const paidOrder = await db.transaction(async (tx) => {
			const sorted = [...items].sort((a, b) =>
				a.courseId.localeCompare(b.courseId)
			);
			const fullTitles: string[] = [];

			for (const item of sorted) {
				const [course] = await tx
					.select({
						seats: courses.seats,
						title: courses.title,
					})
					.from(courses)
					.where(eq(courses.id, item.courseId))
					.for("update")
					.limit(1);

				if (!course || course.seats === null) continue;

				const [alreadyEnrolled] = await tx
					.select({ id: enrollments.id })
					.from(enrollments)
					.where(
						and(
							eq(enrollments.userId, user.id),
							eq(enrollments.courseId, item.courseId)
						)
					)
					.limit(1);

				if (alreadyEnrolled) continue;

				const [row] = await tx
					.select({ total: count() })
					.from(enrollments)
					.where(eq(enrollments.courseId, item.courseId));

				if ((row?.total ?? 0) >= course.seats) {
					fullTitles.push(course.title.pt);
				}
			}

			if (fullTitles.length) {
				throw new CourseFullError(fullTitles);
			}

			const [updated] = await tx
				.update(orders)
				.set({ status: "paid", paidAt: new Date() })
				.where(eq(orders.id, order.id))
				.returning();

			const newEnrollments: NewEnrollment[] = [];
			for (const item of items) {
				const inserted = await tx
					.insert(enrollments)
					.values({
						userId: user.id,
						courseId: item.courseId,
						orderId: order.id,
					})
					.onConflictDoNothing({
						target: [enrollments.userId, enrollments.courseId],
					})
					.returning({
						id: enrollments.id,
						courseId: enrollments.courseId,
						createdAt: enrollments.createdAt,
					});
				newEnrollments.push(
					...inserted.map((row) => ({
						...row,
						amount: Number(item.unitPrice) * item.quantity,
					}))
				);
			}

			// Na mesma transacção: o email só existe se a inscrição for confirmada.
			queuedEmails = await enqueueEnrollmentConfirmation(tx, {
				user,
				enrollments: newEnrollments,
				payment: {
					entity: updated.paymentEntity,
					reference: updated.paymentReference,
					paidAt: updated.paidAt ?? new Date(),
				},
			});

			const [cart] = await tx
				.select()
				.from(carts)
				.where(eq(carts.userId, user.id))
				.limit(1);

			if (cart) {
				await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
			}

			return updated;
		});

		await dispatchEmails(queuedEmails);

		revalidatePath("/cart");
		revalidatePath("/aluno");
		revalidatePath("/aluno/cursos");
		revalidatePath("/");
		revalidatePath("/courses");
		revalidatePath("/calendario");
		revalidatePath("/backoffice/cursos");
		for (const item of items) {
			revalidatePath(`/backoffice/cursos/${item.courseId}/inscritos`);
		}

		return { ok: true as const, order: toOrderView(paidOrder) };
	} catch (error) {
		if (error instanceof CourseFullError) {
			return {
				ok: false as const,
				error: `Já não há vagas para: ${error.titles.join(", ")}.`,
			};
		}
		console.error("simulatePayment:", error);
		return { ok: false as const, error: "Não foi possível confirmar o pagamento." };
	}
}

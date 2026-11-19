"use server";

import { and, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cartItems, carts, courses } from "@/db/schema";
import { countCourseEnrollments, hasOpenSeats } from "@/db/queries/enrollments";
import { auth } from "@/lib/auth";
import { getCoursePricing } from "@/lib/i18n-content";
import type { Localized } from "@/db/schema";

const GUEST_CART_COOKIE = "guest_cart_id";

export type CartViewItem = {
	id: string;
	courseId: string;
	slug: string;
	title: Localized;
	imageUrl: string;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
	currency: string;
};

export type CartView = {
	id: string | null;
	items: CartViewItem[];
	subtotal: number;
	itemCount: number;
};

const emptyCart: CartView = {
	id: null,
	items: [],
	subtotal: 0,
	itemCount: 0,
};

async function getSessionUserId() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session?.user?.id ?? null;
}

async function toCartView(cartId: string): Promise<CartView> {
	const rows = await db.query.cartItems.findMany({
		where: eq(cartItems.cartId, cartId),
		with: {
			course: true,
		},
	});

	const items: CartViewItem[] = rows.map((row) => {
		const unitPrice = Number(row.unitPrice);
		return {
			id: row.id,
			courseId: row.courseId,
			slug: row.course.slug,
			title: row.course.title,
			imageUrl: row.course.imageUrl,
			quantity: row.quantity,
			unitPrice,
			lineTotal: unitPrice * row.quantity,
			currency: row.course.currency || "AOA",
		};
	});

	return {
		id: cartId,
		items,
		subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
		itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
	};
}

async function mergeGuestIntoUser(userId: string, guestId: string) {
	const cookieStore = await cookies();
	const [userCart] = await db
		.select()
		.from(carts)
		.where(eq(carts.userId, userId))
		.limit(1);
	const [guestCart] = await db
		.select()
		.from(carts)
		.where(eq(carts.guestId, guestId))
		.limit(1);

	if (!guestCart) {
		cookieStore.delete(GUEST_CART_COOKIE);
		return userCart ?? null;
	}

	let target = userCart;
	if (!target) {
		const [created] = await db
			.insert(carts)
			.values({ userId })
			.returning();
		target = created;
	}

	const guestRows = await db
		.select()
		.from(cartItems)
		.where(eq(cartItems.cartId, guestCart.id));

	for (const item of guestRows) {
		const [existing] = await db
			.select()
			.from(cartItems)
			.where(
				and(
					eq(cartItems.cartId, target.id),
					eq(cartItems.courseId, item.courseId)
				)
			)
			.limit(1);

		if (existing) {
			await db
				.update(cartItems)
				.set({ quantity: existing.quantity + item.quantity })
				.where(eq(cartItems.id, existing.id));
		} else {
			await db.insert(cartItems).values({
				cartId: target.id,
				courseId: item.courseId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
			});
		}
	}

	await db.delete(carts).where(eq(carts.id, guestCart.id));
	cookieStore.delete(GUEST_CART_COOKIE);
	return target;
}

async function getOrCreateCartRecord() {
	const userId = await getSessionUserId();
	const cookieStore = await cookies();
	const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;

	if (userId) {
		if (guestId) {
			const merged = await mergeGuestIntoUser(userId, guestId);
			if (merged) return merged;
		}

		const [existing] = await db
			.select()
			.from(carts)
			.where(eq(carts.userId, userId))
			.limit(1);
		if (existing) return existing;

		const [created] = await db.insert(carts).values({ userId }).returning();
		return created;
	}

	if (guestId) {
		const [existing] = await db
			.select()
			.from(carts)
			.where(eq(carts.guestId, guestId))
			.limit(1);
		if (existing) return existing;
	}

	const newGuestId = crypto.randomUUID();
	cookieStore.set(GUEST_CART_COOKIE, newGuestId, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
	});

	const [created] = await db
		.insert(carts)
		.values({ guestId: newGuestId })
		.returning();
	return created;
}

export async function getCart(): Promise<CartView> {
	try {
		const userId = await getSessionUserId();
		const cookieStore = await cookies();
		const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;

		if (userId && guestId) {
			const merged = await mergeGuestIntoUser(userId, guestId);
			if (merged) return toCartView(merged.id);
		}

		const cart = userId
			? (
					await db
						.select()
						.from(carts)
						.where(eq(carts.userId, userId))
						.limit(1)
				)[0]
			: guestId
				? (
						await db
							.select()
							.from(carts)
							.where(eq(carts.guestId, guestId))
							.limit(1)
					)[0]
				: null;

		if (!cart) return emptyCart;
		return toCartView(cart.id);
	} catch (error) {
		console.error("Failed to load cart:", error);
		return emptyCart;
	}
}

export async function addToCart(courseId: string) {
	try {
		const cart = await getOrCreateCartRecord();
		const [course] = await db
			.select()
			.from(courses)
			.where(eq(courses.id, courseId))
			.limit(1);

		if (!course || course.status !== "published") {
			return { ok: false as const, error: "Curso não encontrado." };
		}

		const pricing = getCoursePricing(course);
		if (pricing.onRequest) {
			return {
				ok: false as const,
				error: "O valor deste curso confirma-se com a equipa de formação.",
			};
		}
		if (pricing.isFree) {
			return {
				ok: false as const,
				error: "Este curso é gratuito: inscreva-se directamente na página do curso.",
			};
		}

		const enrolled = await countCourseEnrollments(course.id);
		if (!hasOpenSeats(course.seats, enrolled)) {
			return { ok: false as const, error: "Este curso já não tem vagas." };
		}

		const [existing] = await db
			.select()
			.from(cartItems)
			.where(
				and(eq(cartItems.cartId, cart.id), eq(cartItems.courseId, courseId))
			)
			.limit(1);

		if (existing) {
			await db
				.update(cartItems)
				.set({ quantity: existing.quantity + 1 })
				.where(eq(cartItems.id, existing.id));
		} else {
			await db.insert(cartItems).values({
				cartId: cart.id,
				courseId,
				quantity: 1,
				unitPrice: String(pricing.price),
			});
		}

		revalidatePath("/cart");
		return { ok: true as const, cart: await toCartView(cart.id) };
	} catch (error) {
		console.error("Failed to add to cart:", error);
		return {
			ok: false as const,
			error: "Não foi possível adicionar ao carrinho.",
		};
	}
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
	try {
		const nextQuantity = Math.max(1, quantity);
		await db
			.update(cartItems)
			.set({ quantity: nextQuantity })
			.where(eq(cartItems.id, itemId));
		revalidatePath("/cart");
		return { ok: true as const, cart: await getCart() };
	} catch (error) {
		console.error("Failed to update cart item:", error);
		return { ok: true as const, cart: await getCart() };
	}
}

export async function removeCartItem(itemId: string) {
	try {
		await db.delete(cartItems).where(eq(cartItems.id, itemId));
		revalidatePath("/cart");
		return { ok: true as const, cart: await getCart() };
	} catch (error) {
		console.error("Failed to remove cart item:", error);
		return { ok: true as const, cart: await getCart() };
	}
}

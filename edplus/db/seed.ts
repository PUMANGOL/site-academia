import "dotenv/config";
import { eq } from "drizzle-orm";
import {
	cartItems,
	carts,
	categories,
	courseCategories,
	courseInstructors,
	courses,
	enrollments,
	instructorProfiles,
	orderItems,
	pages,
	type PageBlock,
} from "./schema";
import { catalogCategories, catalogCourses, catalogDescription } from "./catalog-2026";

const courseImages = [
	"/assets/img/courses/1.jpg",
	"/assets/img/courses/2.jpg",
	"/assets/img/courses/3.jpg",
	"/assets/img/courses/4.jpg",
	"/assets/img/courses/5.jpg",
	"/assets/img/courses/6.jpg",
	"/assets/img/academia/formacao-tablet.jpg",
	"/assets/img/academia/formacao-laptop.jpg",
	"/assets/img/academia/event-talk.jpg",
];

const retiredCopy = ["Strategic Business", "MBA Executivo", "Pensamento Sistémico"];

function dropRetiredPrograms(blocks: PageBlock[] | null) {
	if (!blocks) return { blocks, changed: false };
	let changed = false;
	const next = blocks.map((block) => {
		if (block.type !== "featuredPrograms" || !block.data || !Array.isArray(block.data.items)) {
			return block;
		}
		const raw = JSON.stringify(block.data.items);
		if (!retiredCopy.some((snippet) => raw.includes(snippet))) return block;
		changed = true;
		const data = { ...block.data };
		delete data.items;
		return { ...block, data };
	});
	return { blocks: next, changed };
}

async function seed() {
	const { db } = await import("./index");
	console.log("Seeding catálogo de formações 2026...");

	await db.delete(cartItems);
	await db.delete(carts);
	await db.delete(courseCategories);
	await db.delete(courseInstructors);
	await db.delete(orderItems);
	await db.delete(enrollments);
	await db.delete(courses);
	await db.delete(instructorProfiles);
	await db.delete(categories);

	const insertedCategories = await db.insert(categories).values(
		catalogCategories.map((category, index) => ({
			slug: category.slug,
			name: category.name,
			iconUrl: `/assets/img/icons/category/${(index % 4) + 2}.svg`,
			imageUrl: courseImages[index] ?? courseImages[0],
			sortOrder: category.sortOrder,
		}))
	).returning();

	const categoryBySlug = Object.fromEntries(
		insertedCategories.map((category) => [category.slug, category])
	);

	const [instructor] = await db
		.insert(instructorProfiles)
		.values({
			slug: "academia-pumangol",
			name: "Academia Pumangol",
			headline: {
				pt: "Equipa de formadores da Academia",
				en: "Academy training team",
			},
			bio: {
				pt: "Formadores especializados, com experiência prática e pedagógica, nas formações do Catálogo 2026.",
				en: "Specialist trainers, with practical and teaching experience, on the 2026 catalogue programmes.",
			},
			photoUrl: "/assets/img/academia/formador-andreas.jpg",
			isFeatured: true,
		})
		.returning();

	for (const [index, item] of catalogCourses.entries()) {
		const description = catalogDescription(item);
		const [course] = await db
			.insert(courses)
			.values({
				slug: item.slug,
				instructorId: instructor.id,
				title: item.title,
				excerpt: item.objective,
				description,
				objectives: item.objective,
				imageUrl: courseImages[index % courseImages.length],
				price: "0",
				isFree: false,
				lessonsCount: 0,
				durationMinutes: item.hours * 60,
				studentsCount: 0,
				ratingAvg: "0",
				reviewsCount: 0,
				skillLevel: item.level,
				language: "pt",
				currency: "AOA",
				modality: "in_person",
				status: "published",
				isFeatured: Boolean(item.featured),
				publishedAt: new Date(),
			})
			.returning();

		const category = categoryBySlug[item.category];
		if (category) {
			await db.insert(courseCategories).values({
				courseId: course.id,
				categoryId: category.id,
			});
		}
	}

	const storedPages = await db.select().from(pages);
	for (const page of storedPages) {
		const draft = dropRetiredPrograms(page.draftBlocks);
		const published = dropRetiredPrograms(page.publishedBlocks);
		if (!draft.changed && !published.changed) continue;
		await db
			.update(pages)
			.set({
				draftBlocks: draft.blocks ?? [],
				publishedBlocks: published.blocks,
			})
			.where(eq(pages.id, page.id));
	}

	console.log(`Seed complete. Courses: ${catalogCourses.length}. Categories: ${catalogCategories.length}.`);
	process.exit(0);
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});

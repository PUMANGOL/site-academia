import "dotenv/config";
import { eq } from "drizzle-orm";
import { user } from "./schema";
import { auth } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@pumangol.co.ao";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin1234!";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";

async function seedAdmin() {
	const { db } = await import("./index");

	const [existing] = await db
		.select()
		.from(user)
		.where(eq(user.email, ADMIN_EMAIL))
		.limit(1);

	if (existing) {
		await db.update(user).set({ role: "admin" }).where(eq(user.id, existing.id));
		console.log(`Utilizador existente promovido a admin: ${ADMIN_EMAIL}`);
		process.exit(0);
	}

	await auth.api.signUpEmail({
		body: {
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
			name: "Administrador",
			username: ADMIN_USERNAME,
		},
	});

	const [created] = await db
		.select()
		.from(user)
		.where(eq(user.email, ADMIN_EMAIL))
		.limit(1);

	if (created) {
		await db.update(user).set({ role: "admin" }).where(eq(user.id, created.id));
	}

	console.log("Admin criado com sucesso:");
	console.log(`  Email: ${ADMIN_EMAIL}`);
	console.log(`  Utilizador: ${ADMIN_USERNAME}`);
	console.log(`  Password: ${ADMIN_PASSWORD}`);
	console.log("  Aceda em /backoffice/login");
	process.exit(0);
}

seedAdmin().catch((error) => {
	console.error(error);
	process.exit(1);
});

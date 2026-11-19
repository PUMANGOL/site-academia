import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { EMAIL_PRIORITY } from "@/lib/mail/jobs";
import { enqueueEmail } from "@/lib/mail/queue";
import { DEFAULT_USER_ROLE } from "@/lib/roles";

export const auth = betterAuth({
	appName: "Academia Pumangol",
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		resetPasswordTokenExpiresIn: 60 * 60,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await enqueueEmail({
				template: "password_reset",
				to: user.email,
				payload: { name: user.name, url },
				priority: EMAIL_PRIORITY.urgent,
			});
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: DEFAULT_USER_ROLE,
				input: false,
			},
		},
	},
	plugins: [
		username(),
		admin({
			defaultRole: DEFAULT_USER_ROLE,
			adminRoles: ["admin"],
			bannedUserMessage:
				"A sua conta foi suspensa. Contacte a Academia Pumangol para mais informações.",
		}),
		nextCookies(),
	],
});

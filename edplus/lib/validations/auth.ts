import { z } from "zod";

type Translate = (key: string) => string;

const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;

export function createLoginSchema(t: Translate) {
	return z.object({
		identifier: z
			.string()
			.trim()
			.min(1, { error: t("auth.validation.identifierRequired") })
			.superRefine((value, ctx) => {
				if (value.includes("@")) {
					if (!z.email().safeParse(value).success) {
						ctx.addIssue({
							code: "custom",
							message: t("auth.validation.emailInvalid"),
						});
					}
					return;
				}

				if (value.length < 3) {
					ctx.addIssue({
						code: "custom",
						message: t("auth.validation.usernameMin"),
					});
				}
			}),
		password: z
			.string()
			.min(1, { error: t("auth.validation.passwordRequired") })
			.min(8, { error: t("auth.validation.passwordMin") }),
		rememberMe: z.boolean(),
	});
}

export function createRegisterSchema(t: Translate) {
	return z.object({
		username: z
			.string()
			.trim()
			.min(1, { error: t("auth.validation.usernameRequired") })
			.min(3, { error: t("auth.validation.usernameMin") })
			.max(30, { error: t("auth.validation.usernameMax") })
			.regex(USERNAME_PATTERN, {
				error: t("auth.validation.usernameFormat"),
			}),
		fullname: z
			.string()
			.trim()
			.max(180, { error: t("auth.validation.fullNameMax") })
			.optional()
			.transform((value) => value || undefined)
			.refine((value) => !value || value.length >= 2, {
				error: t("auth.validation.fullNameMin"),
			}),
		email: z
			.string()
			.trim()
			.min(1, { error: t("auth.validation.emailRequired") })
			.pipe(z.email({ error: t("auth.validation.emailInvalid") })),
		password: z
			.string()
			.min(1, { error: t("auth.validation.passwordRequired") })
			.min(8, { error: t("auth.validation.passwordMin") })
			.max(128, { error: t("auth.validation.passwordMax") }),
	});
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;

export function fieldErrors<T>(error: z.ZodError<T>) {
	return z.flattenError(error).fieldErrors as Record<
		string,
		string[] | undefined
	>;
}

export function firstError(
	errors: Record<string, string[] | undefined>,
	field: string
) {
	return errors[field]?.[0];
}

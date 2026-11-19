"use client";

import { useI18n } from "@/app/i18n/I18nProvider";
import { useTheme } from "@/app/providers/theme-provider";

export default function ThemeSwitcher() {
	const { theme, toggleTheme } = useTheme();
	const { t } = useI18n();
	const isDark = theme === "dark";
	const label = isDark ? t("theme.toLight") : t("theme.toDark");

	return (
		<button
			type="button"
			className="theme-toggle"
			onClick={toggleTheme}
			aria-label={label}
			title={label}
		>
			<i className={isDark ? "ph ph-sun" : "ph ph-moon"} aria-hidden="true"></i>
		</button>
	);
}

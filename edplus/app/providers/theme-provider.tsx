"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

export type Theme = "light" | "dark";

export const defaultTheme: Theme = "light";
export const THEME_STORAGE_KEY = "academia-theme";

type ThemeContextValue = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.dataset.theme = theme;
	root.dataset.bsTheme = theme;
	root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
		const next =
			saved === "light" || saved === "dark" ? saved : defaultTheme;
		setThemeState(next);
		applyTheme(next);
		setReady(true);
	}, []);

	useEffect(() => {
		if (!ready) return;
		applyTheme(theme);
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme, ready]);

	const setTheme = useCallback((next: Theme) => {
		setThemeState(next);
	}, []);

	const toggleTheme = useCallback(() => {
		setThemeState((current) => (current === "dark" ? "light" : "dark"));
	}, []);

	const value = useMemo(
		() => ({ theme, setTheme, toggleTheme }),
		[theme, setTheme, toggleTheme]
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}

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
import { defaultLocale, messages, type Locale } from "./messages";

type Vars = Record<string, string | number>;

type I18nContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: string, vars?: Vars) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "academia-locale";

function lookup(locale: Locale, key: string): string {
	const parts = key.split(".");
	let current: unknown = messages[locale];
	for (const part of parts) {
		if (current && typeof current === "object" && part in current) {
			current = (current as Record<string, unknown>)[part];
		} else {
			return key;
		}
	}
	return typeof current === "string" ? current : key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(defaultLocale);

	useEffect(() => {
		const saved = window.localStorage.getItem(STORAGE_KEY);
		if (saved === "pt" || saved === "en") {
			setLocaleState(saved);
		}
	}, []);

	useEffect(() => {
		document.documentElement.lang = locale;
		window.localStorage.setItem(STORAGE_KEY, locale);
	}, [locale]);

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next);
	}, []);

	const t = useCallback(
		(key: string, vars?: Vars) => {
			let value = lookup(locale, key);
			if (vars) {
				for (const [name, replacement] of Object.entries(vars)) {
					value = value.replaceAll(`{${name}}`, String(replacement));
				}
			}
			return value;
		},
		[locale]
	);

	const value = useMemo(
		() => ({ locale, setLocale, t }),
		[locale, setLocale, t]
	);

	return (
		<I18nContext.Provider value={value}>{children}</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within I18nProvider");
	}
	return context;
}

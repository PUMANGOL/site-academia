"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "./messages";
import { useI18n } from "./I18nProvider";

const languages: { code: Locale; label: string; short: string; flag: string }[] = [
	{
		code: "pt",
		label: "Português",
		short: "PT-AO",
		flag: "/assets/img/flags/ao.svg",
	},
	{
		code: "en",
		label: "English",
		short: "EN",
		flag: "/assets/img/flags/gb.svg",
	},
];

export default function LanguageSwitcher() {
	const { locale, setLocale } = useI18n();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const current = languages.find((item) => item.code === locale) ?? languages[0];

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, []);

	return (
		<div className={`lang-dropdown${open ? " is-open" : ""}`} ref={ref}>
			<button
				type="button"
				className="lang-dropdown-toggle"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={current.label}
				onClick={() => setOpen((value) => !value)}
			>
				<img src={current.flag} alt="" width={22} height={15} />
				<span>{current.short}</span>
				<i className="ph ph-caret-down"></i>
			</button>

			{open ? (
				<ul className="lang-dropdown-menu" role="listbox">
					{languages.map((language) => (
						<li key={language.code} role="option" aria-selected={locale === language.code}>
							<button
								type="button"
								className={locale === language.code ? "active" : ""}
								onClick={() => {
									setLocale(language.code);
									setOpen(false);
								}}
							>
								<img src={language.flag} alt="" width={22} height={15} />
								<span>{language.label}</span>
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

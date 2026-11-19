"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchCourses, type CourseSearchResult } from "@/app/actions/search";
import { useI18n } from "@/app/i18n/I18nProvider";
import { pickLocale } from "@/lib/i18n-content";

type PopupSearchProps = {
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
};

const DEBOUNCE_MS = 250;

export default function PopupSearch({
  searchOpen,
  setSearchOpen,
}: PopupSearchProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<{
    term: string;
    results: CourseSearchResult[];
    total: number;
  } | null>(null);
  const term = query.trim();
  const settled = response?.term === term;
  const results = settled ? response.results : [];
  const total = settled ? response.total : 0;
  const loading = term.length >= 2 && !settled;

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (term.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const found = await searchCourses(term);
      if (!cancelled) setResponse({ term, ...found });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  function close() {
    setSearchOpen(false);
  }

  function goToCatalog() {
    close();
    router.push(term ? `/catalogo?q=${encodeURIComponent(term)}` : "/catalogo");
  }

  return (
    <div
      id="popup_searchbox"
      className={`popup_searchbox_wrapper ${
        searchOpen ? "popupsbox_active" : ""
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <div className="searchbox_drawer position-relative">
        <button type="button" className="popup_close" onClick={close}>
          <i className="bx bx-x"></i>
        </button>

        <div className="popup_searchform text-center">
          <div className="col-12 col-lg-7 mx-auto">
            <form
              className="position-relative"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                goToCatalog();
              }}
            >
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search.globalPlaceholder")}
                aria-label={t("search.button")}
              />

              <button type="submit" aria-label={t("search.button")}>
                <i className="ph ph-magnifying-glass"></i>
              </button>
            </form>

            {term.length >= 2 ? (
              <div className="popup_search_results text-start">
                {loading ? (
                  <p className="psr_status">{t("search.searching")}</p>
                ) : !results.length ? (
                  <p className="psr_status">
                    {t("search.noResults", { query: term })}
                  </p>
                ) : (
                  <>
                    <ul>
                      {results.map((course) => (
                        <li key={course.id}>
                          <Link href={`/courses/${course.slug}`} onClick={close}>
                            <Image
                              src={course.imageUrl}
                              alt=""
                              width={64}
                              height={48}
                            />
                            <span className="psr_text">
                              <strong>{pickLocale(course.title, locale)}</strong>
                              <small>
                                {[
                                  pickLocale(course.categoryName, locale),
                                  course.instructorNames.join(", "),
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </small>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="psr_view_all"
                      onClick={goToCatalog}
                    >
                      {t("search.viewAll", { count: total })}{" "}
                      <i className="ph ph-arrow-right"></i>
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

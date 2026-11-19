"use server";

import { getPublishedCourses } from "@/db/queries/courses";
import type { Localized } from "@/db/schema";
import { matchesAllTerms } from "@/lib/search";

export type CourseSearchResult = {
	id: string;
	slug: string;
	title: Localized;
	categoryName: Localized;
	imageUrl: string;
	instructorNames: string[];
};

const MAX_RESULTS = 6;

export async function searchCourses(query: string) {
	const term = query.trim().slice(0, 100);
	if (term.length < 2) return { results: [], total: 0 };

	const matches = (await getPublishedCourses()).filter((course) =>
		matchesAllTerms(term, course.searchText)
	);

	return {
		total: matches.length,
		results: matches.slice(0, MAX_RESULTS).map(
			(course): CourseSearchResult => ({
				id: course.id,
				slug: course.slug,
				title: course.title,
				categoryName: course.categoryName,
				imageUrl: course.imageUrl,
				instructorNames: course.instructorNames,
			})
		),
	};
}

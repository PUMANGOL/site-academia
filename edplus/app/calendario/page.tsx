import SiteShell from "@/app/components/site-shell";
import CalendarContent from "@/app/template-parts/calendar";
import { getPublishedCourses } from "@/db/queries/courses";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
	const courses = await getPublishedCourses();

	return (
		<SiteShell page="calendar">
			<CalendarContent courses={courses} />
		</SiteShell>
	);
}

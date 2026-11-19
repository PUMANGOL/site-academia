import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/app/backoffice/components/page-header";
import EnrollmentProgressBar from "@/app/aluno/components/enrollment-progress-bar";
import { getStudentCourses } from "@/db/queries/student";
import { requireUser } from "@/lib/admin-auth";
import { pickLocale } from "@/lib/i18n-content";

export const dynamic = "force-dynamic";

export default async function AlunoCursosPage() {
	const session = await requireUser();
	const courses = await getStudentCourses(session.user.id);

	return (
		<div>
			<PageHeader
				title="Os meus cursos"
				description="Cursos e formações em que está matriculado"
			/>

			{courses.length ? (
				<div className="admin-my-courses-grid admin-my-courses-grid-wide">
					{courses.map((course) => (
						<div key={course.enrollmentId} className="admin-my-course-card">
							<Link href={`/courses/${course.slug}`}>
								<div className="admin-my-course-thumb">
									<Image
										src={course.imageUrl}
										alt={pickLocale(course.title, "pt")}
										fill
										sizes="280px"
									/>
								</div>
								<div className="admin-my-course-body">
									<p className="admin-my-course-title">
										{pickLocale(course.title, "pt")}
									</p>
									{course.instructorName ? (
										<p className="admin-my-course-meta">{course.instructorName}</p>
									) : null}
									<p className="admin-my-course-meta">
										{course.lessonsCount} lições
										{course.durationMinutes
											? ` · ${Math.round(course.durationMinutes / 60)}h`
											: ""}
									</p>
								</div>
							</Link>
							<EnrollmentProgressBar status={course.status} progress={course.progress} />
						</div>
					))}
				</div>
			) : (
				<div className="admin-empty">
					Ainda não está matriculado em nenhum curso.{" "}
					<Link href="/courses">Ver catálogo de cursos</Link>.
				</div>
			)}
		</div>
	);
}

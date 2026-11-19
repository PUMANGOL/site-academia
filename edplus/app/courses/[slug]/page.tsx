import { notFound } from "next/navigation";
import Header from "../../layouts/header2";
import Banner from "../../components/banner";
import CourseDetails from "../../template-parts/course-details";
import Footer from "../../layouts/foooter2";
import { getPublishedCourseBySlug } from "@/db/queries/courses";

export const dynamic = "force-dynamic";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <Header />
        <Banner page="courseDetails" />
        <CourseDetails course={course} />
      <Footer />
    </>
  );
}

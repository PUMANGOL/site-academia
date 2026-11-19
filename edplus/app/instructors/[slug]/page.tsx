import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../layouts/header2";
import Banner from "../../components/banner";
import InstructorProfile from "../../template-parts/instructor-profile";
import Footer from "../../layouts/foooter2";
import { getPublicInstructor } from "@/db/queries/instructors";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const result = await getPublicInstructor(slug);
	if (!result) return {};
	return {
		title: `${result.instructor.name} — Academia Pumangol`,
		description: result.instructor.headline.pt || undefined,
	};
}

export default async function InstructorPage({ params }: Props) {
	const { slug } = await params;
	const result = await getPublicInstructor(slug);
	if (!result) notFound();

	return (
		<>
			<Header />
			<Banner page="instructorDetails" />
			<InstructorProfile instructor={result.instructor} courses={result.courses} />
			<Footer />
		</>
	);
}
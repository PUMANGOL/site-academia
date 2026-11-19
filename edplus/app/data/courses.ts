export type CourseRecord = {
	id: number;
	slug: "ml" | "finance" | "api" | "seo" | "app" | "design";
	image: string;
	filter: string[];
	lessons: number;
	students: number;
	price: string;
	videoId: string;
	rating: string;
	author: string;
	authorImage: string;
};

export const coursesCatalog: CourseRecord[] = [
	{
		id: 1,
		slug: "ml",
		image: "/assets/img/courses/1.jpg",
		filter: ["art-design"],
		lessons: 98,
		students: 54,
		price: "72.000 Kz",
		videoId: "78t8LnQjOVs",
		rating: "4.8",
		author: "Ana Ferreira",
		authorImage: "/assets/img/courses/author/1.png",
	},
	{
		id: 2,
		slug: "finance",
		image: "/assets/img/courses/2.jpg",
		filter: ["art-design", "finance"],
		lessons: 75,
		students: 45,
		price: "45.000 Kz",
		videoId: "78t8LnQjOVs",
		rating: "4.7",
		author: "Ana Ferreira",
		authorImage: "/assets/img/courses/author/1.png",
	},
	{
		id: 3,
		slug: "api",
		image: "/assets/img/courses/3.jpg",
		filter: ["finance", "marketing"],
		lessons: 87,
		students: 69,
		price: "85.000 Kz",
		videoId: "78t8LnQjOVs",
		rating: "4.9",
		author: "Ana Ferreira",
		authorImage: "/assets/img/courses/author/1.png",
	},
	{
		id: 4,
		slug: "seo",
		image: "/assets/img/courses/4.jpg",
		filter: ["art-design", "finance"],
		lessons: 20,
		students: 125,
		price: "98.000 Kz",
		videoId: "78t8LnQjOVs",
		rating: "4.6",
		author: "Ana Ferreira",
		authorImage: "/assets/img/courses/author/1.png",
	},
	{
		id: 5,
		slug: "app",
		image: "/assets/img/courses/5.jpg",
		filter: ["finance"],
		lessons: 250,
		students: 85,
		price: "25.000 Kz",
		videoId: "78t8LnQjOVs",
		rating: "4.8",
		author: "Ana Ferreira",
		authorImage: "/assets/img/courses/author/1.png",
	},
	{
		id: 6,
		slug: "design",
		image: "/assets/img/courses/6.jpg",
		filter: ["marketing"],
		lessons: 250,
		students: 100,
		price: "58.000 Kz",
		videoId: "78t8LnQjOVs",
		rating: "4.5",
		author: "Ana Ferreira",
		authorImage: "/assets/img/courses/author/1.png",
	},
];

export function localizeCourses(
	t: (key: string, vars?: Record<string, string | number>) => string
) {
	return coursesCatalog.map((course) => ({
		...course,
		title: t(`courseItems.${course.slug}.title`),
		category: t(`courseItems.${course.slug}.category`),
		lessonsLabel: t("courses.lessons", { count: course.lessons }),
		studentsLabel: t("courses.students", { count: course.students }),
	}));
}

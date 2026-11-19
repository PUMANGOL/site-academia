"use client";

import Image from "next/image";
import Link from "next/link";
import { localizeCourses } from "@/app/data/courses";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Courses4() {
	const { t } = useI18n();
	const courses = localizeCourses(t);
	return (
        <section className="courses section-padding">
			<div className="container">	
				<div className="row align-items-center course_top mb-5">
					<div className="col-md-6 col-12 wow fadeInUp">
						<p className="ccount_result">{t("courses.showing", { shown: 6 })} <span>{t("courses.showingSpan")}</span> {t("courses.showingOf", { total: 6 })}</p>
					</div>		

					<div className="col-md-6 col-12 text-md-end wow fadeInUp">
						<div className="csearch_form">
							<form action="#" method="get">
								<input type="text" className="csearch_input" placeholder={t("courses.searchPlaceholder")} />
							</form>
						</div>
					</div>	
				</div>

                    <div className="row gy-4 course_item">
                        {courses.map((course, index) => (
                            <div
                            className="col-lg-6 col-12 wow fadeInUp"
                            key={index}
                            >
                                <div className="single_course course_style5">
                                    <div className="row">
                                    <div className="col-xl-6 col-12">
                                        <div className="course_img">
                                        <div className="ccategory">
                                            <Link href="#">{course.category}</Link>
                                        </div>

                                        <Image
                                            src={course.image}
                                            alt={course.title}
                                            width={370}
                                            height={280}
                                        />
                                        </div>
                                    </div>

                                    <div className="col-xl-6 col-12">
                                        <div className="course_content">
                                        <div className="crating_number">
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-regular fa-star"></i>
                                            <span>{t("courses.rating", { rating: course.rating, count: 3 })}</span>
                                        </div>

                                        <h3>
                                            <Link href="/course-details">
                                            {course.title}
                                            </Link>
                                        </h3>

                                        <div className="cmeta d-flex gap-4">
                                            <div className="single_meta">
                                            <i className="fa-regular fa-user"></i>{" "}
                                            {course.studentsLabel}
                                            </div>

                                            <div className="single_meta">
                                            <i className="fa-solid fa-book"></i>{" "}
                                            {course.lessonsLabel}
                                            </div>
                                        </div>

                                        <div className="cbtm">
                                            <div className="c_price float-start">
                                            {course.price}
                                            </div>

                                            <div className="c_author float-end">
                                            <Image
                                                src={course.authorImage}
                                                alt={course.author}
                                                width={35}
                                                height={35}
                                                className="d-inline-block"
                                            />{" "}
                                            <Link href="#">{course.author}</Link>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="col-12 text-center wow fadeInUp">
                            <div className="post_pagination">
                                <ul>
                                    <li><a href="#"><i className="ph ph-arrow-left"></i></a></li>
                                    <li><a href="#">1</a></li>
                                    <li className="active"><a href="#">2</a></li>
                                    <li><a href="#">3</a></li>
                                    <li><a href="#"><i className="ph ph-arrow-right"></i></a></li>
                                </ul>
                            </div>
                        </div>	
                    </div>
			</div>
		</section>
       
	);
}
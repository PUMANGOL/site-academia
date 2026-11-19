
"use client";

import { useState } from "react";
import Link from "next/link";
import VideoPopup from "../VideoPopup";
import { localizeCourses } from "@/app/data/courses";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function InstructorDetailsPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [videoId, setVideoId] = useState("");
  const courses = localizeCourses(t);
  return (
    <>
      {/* Start Instructor Details */}
      <div className="instructor-details pt100">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="id_image text-start text-lg-center">
                <img
                  src="/assets/img/teachers/details.jpg"
                  alt="Masum Billah"
                />

                <div className="id_meta mt-4 mb-2 pb-2">
                  <span>
                    <i className="fa-solid fa-book"></i> {t("instructorPage.courses", { count: 45 })}
                  </span>
                  <span>
                    <i className="fa-solid fa-user"></i> {t("instructorPage.students", { count: 600 })}
                  </span>
                </div>

                <p>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star-half-stroke"></i>
                  <span>{t("instructorPage.ratings", { count: 500 })}</span>
                </p>
              </div>
            </div>

            {/* End Col */}

            <div className="col-lg-7">
              <div className="id_content">
                <h3>Md. Masum Billah</h3>
                <span>{t("instructorPage.role")}</span>

                <h4>{t("instructorPage.about")}</h4>

                <p>
                  {t("instructorPage.bio")}
                </p>

                <h4>{t("instructorPage.contact")}</h4>

                <ul className="id_cinfo">
                  <li>
                    <strong>{t("instructorPage.experience")}</strong> {t("instructorPage.experienceValue")}
                  </li>

                  <li>
                    <strong>{t("instructorPage.email")}</strong> support@edplus.com
                  </li>

                  <li>
                    <strong>{t("instructorPage.education")}</strong> {t("instructorPage.educationValue")}
                  </li>

                  <li>
                    <strong>{t("instructorPage.phone")}</strong> +91 258 654 583
                  </li>

                  <li>
                    <strong>{t("instructorPage.website")}</strong>{" "}
                    <a href="#">www.edplus.com</a>
                  </li>
                </ul>

                <ul className="id_social">
                  <li>
                    <a href="#">
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>
                  </li>

                  <li>
                    <a href="#">
                      <i className="fa-brands fa-x-twitter"></i>
                    </a>
                  </li>

                  <li>
                    <a href="#">
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                  </li>

                  <li>
                    <a href="#">
                      <i className="fa-brands fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* End Col */}
          </div>
        </div>
      </div>
      {/* End Instructor Details */}


{/* Start Courses */}
      <section className="courses pb100 pt-5">
        <div className="container">
          <div className="row">
            <div className="col-12 wow fadeInUp">
              <div className="section-title text-start">
                <span>{t("instructorPage.myCourses")}</span>
                <h2>{t("instructorPage.popular")}</h2>
                <img src="/assets/img/shapes/title.svg" alt="" />
              </div>
            </div>
          </div>

          <div className="row gy-4 course_item">
            {courses.map((course, index) => (
              <div
                className="col-xl-4 col-md-6 col-12 wow fadeInUp"
                key={index}
              >
                <div className="single_course course_style2">
                  <div className="course_img">
                    <div className="ccategory">
                      <a href="#">
                        <i className="ph ph-folder-open"></i>{" "}
                        {course.category}
                      </a>
                    </div>

                    <img src={course.image} alt={course.title} />

                    <a
                      href="#"
                      className="cvbtn"
                      onClick={(e) => {
                        setVideoId(course.videoId);
                        e.preventDefault();
                        setOpen(true);
                      }}
                    >
                      <i className="ph ph-video-camera"></i>
                    </a>
                  </div>

                  <div className="course_content">
                    <div className="crating_number">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-regular fa-star"></i>
                      <span>{t("courses.rating", { rating: "4.8", count: 3 })}</span>
                    </div>

                    <h3>
                      <Link href="/course-details">{course.title}</Link>
                    </h3>

                    <div className="cmeta d-flex gap-5">
                      <div className="single_meta">
                        <i className="fa-solid fa-book"></i>{" "}
                        {course.lessonsLabel}
                      </div>

                      <div className="single_meta">
                        <i className="fa-regular fa-user"></i>{" "}
                        {course.studentsLabel}
                      </div>
                    </div>

                    <div className="cbtm">
                      <div className="c_price float-start">
                        {course.price}
                      </div>

                      <div className="c_author float-end">
                        <img
                          src="/assets/img/courses/author/1.png"
                          alt="Author"
                          className="d-inline-block align-top"
                        />{" "}
                        <Link href="/instructor-details">Dev. Masum Billah</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          <VideoPopup
            open={open}
            setOpen={setOpen}
            videoId={videoId}
          />
      </section>
      {/* End Courses */}
    </>
  );
}
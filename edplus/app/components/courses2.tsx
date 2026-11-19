"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import VideoPopup from "../VideoPopup";
import { localizeCourses } from "@/app/data/courses";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function PopularCourses() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [videoId, setVideoId] = useState("");
  const courses = localizeCourses(t);

  return (
    <section className="courses">
      <div className="container">
        <div className="row">
          <div className="col-12 wow fadeInUp">
            <div className="section-title text-center">
              <span>{t("courses.eyebrow")}</span>
              <h2>{t("courses.title")}</h2>

              <Image
                src="/assets/img/shapes/title.svg"
                alt="Title Shape"
                width={216}
                height={20}
                className="d-inline-block"
              />
            </div>
          </div>
        </div>

        <div className="row gy-4 course_item">
          {courses.map((course, index) => (
            <div
              key={index}
              className="col-xl-4 col-md-6 col-12 wow fadeInUp"
            >
              <div className="single_course course_style2">
                <div className="course_img">
                  <div className="ccategory">
                    <Link href="#">
                      <i className="ph ph-folder-open"></i>{" "}
                      {course.category}
                    </Link>
                  </div>

                  <Image
                    src={course.image}
                    alt={course.title}
                    width={410}
                    height={280}
                  />

                    <Link
                      href="#"
                      className="cvbtn"
                      onClick={(e) => {
                        setVideoId(course.videoId);   
                        e.preventDefault();
                        setOpen(true);
                      }}
                  >
                    <i className="ph ph-video-camera"></i>
                  </Link>
                </div>

                <div className="course_content">
                  <div className="crating_number">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>

                    <span>(4.8 / 3 Rating)</span>
                  </div>

                  <h3>
                    <Link href="/course-details">
                      {course.title}
                    </Link>
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
                      <Image
                        src="/assets/img/courses/author/1.png"
                        alt={course.author}
                        width={33}
                        height={33}
                        className="d-inline-block"
                      />

                      <Link href="#">
                        {course.author}
                      </Link>
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
  );
}
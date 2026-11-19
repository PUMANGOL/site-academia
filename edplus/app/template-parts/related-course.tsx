"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import VideoPopup from "../VideoPopup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import { localizeCourses } from "@/app/data/courses";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function RelatedCourses() {
      const { t } = useI18n();
      const [open, setOpen] = useState(false);
      const [videoId, setVideoId] = useState("");
      const relatedCourses = localizeCourses(t).slice(0, 4);
  return (
    <>
      <div className="related-courses position-relative">
        <h3 className="created-title mb-4">{t("courses.related")}</h3>

        <Swiper
          modules={[Navigation]}
          navigation={{
              prevEl: ".rcn-prev",
              nextEl: ".rcn-next",
          }}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          breakpoints={{
            576: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1200: {
              slidesPerView: 3,
            },
          }}
          className="relcourse_slider"
        >
          {relatedCourses.map((course, index) => (
            <SwiperSlide key={index}>
              <div className="single_course">
                <div className="course_img">
                  <div className="ccategory">
                    <a href="#">
                      <i className="ph ph-folder-open"></i> {course.category}
                    </a>
                  </div>
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={690}
                    height={430}
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
                    <i className="fa-solid fa-star"></i> 4.8
                  </div>

                  <h3>
                    <a href="#">{course.title}</a>
                  </h3>

                  <div className="cmeta d-flex gap-5">
                    <div className="single_meta">
                      <i className="ph ph-book"></i> {course.lessonsLabel}
                    </div>

                    <div className="single_meta">
                      <i className="ph ph-graduation-cap"></i>{" "}
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
                        className="d-inline-block"
                      />{" "}
                      <Link href="/instructor-details">Dev. Masum Billah</Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}         
        </Swiper>

        <div className="related_courses_nav">
            <button type="button" role="presentation" className="rcn-prev">
              <i className="ph ph-arrow-left"></i>
            </button>

            <button type="button" role="presentation" className="rcn-next">
              <i className="ph ph-arrow-right"></i>
            </button>
          </div>   
        <VideoPopup
            open={open}
            setOpen={setOpen}
            videoId={videoId}
          />
      </div>

      
    </>
  );
}
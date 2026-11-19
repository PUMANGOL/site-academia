"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function HomeBannerThree() {
  const { t } = useI18n();
  return (
    <section
      className="home-banner banner-3"
      style={{
        backgroundImage: "url('/assets/img/bg/home-banner3.jpg')",
      }}
    >
      <div className="container position-relative">
        <div className="row">
          <div className="col-xl-6 col-lg-7 col-12 align-self-center">
            <div className="banner_content">
              <span
                className="wow fadeInUp"
                data-wow-delay=".3s"
              >
                <Image
                  src="/assets/img/icons/graduation-hat-blue.svg"
                  alt="Graduation Hat"
                  width={41}
                  height={41}
                  className="d-inline-block"
                />
                {t("banner.keepLearning")}
              </span>

              <h2
                className="wow fadeInUp"
                data-wow-delay=".5s"
              >
                {t("banner.title")} <br />
                {t("banner.titleFrom")}
              </h2>

              <p
                className="wow fadeInUp"
                data-wow-delay=".7s"
              >
                {t("banner.text")}
              </p>

              <div
                className="d-flex gap-4 wow fadeInUp"
                data-wow-delay=".9s"
              >
                <Link
                  href="#"
                  className="blue_btn round_btn"
                >
                  {t("banner.findCourses")}{" "}
                  <i className="ph ph-arrow-right"></i>
                </Link>

                <div className="brating d-flex">
                  <Image
                    src="/assets/img/icons/trustpilot-dark.svg"
                    alt="Trustpilot"
                    width={120}
                    height={24}
                    className="align-self-center"
                  />

                  <p className="align-self-center">
                    <i className="fa-solid fa-star"></i>{" "}
                    4.8 {t("banner.rating")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* End Col */}

          <div
            className="col-xl-6 col-lg-5 d-none d-lg-block col-12 align-self-center position-relative wow fadeInUp"
            data-wow-delay=".4s"
          >
            <div
              className="sbanner_image_wrap"
              style={{
                backgroundImage:
                  "url('/assets/img/shapes/banner_bg.png')",
              }}
            >
              <Image
                src="/assets/img/bg/banner-search.jpg"
                alt="Banner"
                width={747}
                height={706}
                className="searchbanner_image wow fadeInUp"
              />
  
            </div>

            <div
              className="bbadge badge2 wow fadeInUp"
              data-wow-delay=".7s"
            >
              <Image
                src="/assets/img/icons/bbadge-icon.svg"
                alt="Badge Icon"
                width={60}
                height={60}
              />

              <div className="bb_text">
                <h3>
                  <span className="count">250</span> +
                </h3>

                <p>{t("banner.enrolledStudents")}</p>
              </div>
            </div>
          </div>
        </div>

        <Image
          src="/assets/img/shapes/b1.svg"
          alt="Shape"
          width={120}
          height={120}
          className="bshape1 aniupDown position-absolute"
        />

        <Image
          src="/assets/img/shapes/b2.svg"
          alt="Shape"
          width={120}
          height={120}
          className="bshape2 position-absolute"
        />

        <Image
          src="/assets/img/shapes/bstar.svg"
          alt="Star Shape"
          width={120}
          height={120}
          className="bshape3 aniupDown position-absolute"
        />

        <Image
          src="/assets/img/shapes/b4.svg"
          alt="Shape"
          width={27}
          height={18}
          className="bshape4 anileftRight position-absolute"
        />
      </div>
    </section>
  );
}
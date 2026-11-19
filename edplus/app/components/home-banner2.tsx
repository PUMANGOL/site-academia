"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function HomeBanner2() {
  const { t } = useI18n();
  return (
    <section
      className="home-banner banner-2"
      style={{
        backgroundImage: "url('/assets/img/bg/home-3.jpg')",
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
                  src="/assets/img/icons/graduation-hat-white.svg"
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

              <div className="banner_search_form">
                <form
                  action="3"
                  className="position-relative"
                  method="post"
                >
                  <input
                    type="text"
                    className="form-control"
                    name="s"
                    placeholder={t("search.placeholder")}
                    required
                  />

                  <button
                    type="submit"
                    className="bsearch_btn"
                  >
                    {t("searchExtra.search")} <i className="ph ph-magnifying-glass"></i>
                  </button>

                  <input
                    type="hidden"
                    name="post_type"
                    value="courses"
                  />
                </form>
              </div>

              <div className="bcate">
                {t("searchExtra.categories")}
                <Link href="/category">
                   {t("category.items.animation")}
                </Link>
                <span className="cat_coma">,</span>

                <Link href="/category">
                  {t("category.items.art")}
                </Link>
                <span className="cat_coma">,</span>

                <Link href="/category">
                  {t("category.items.data")}
                </Link>
                <span className="cat_coma">,</span>

                <Link href="/category">
                  {t("category.items.finance")}
                </Link>
                <span className="cat_coma">,</span>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-lg-5 d-none d-lg-block col-12 align-self-center">
            <Image
              src="/assets/img/bg/banner-search.jpg"
              alt="Banner Image"
              width={650}
              height={650}
              className="sbanner_image wow fadeInUp"
              data-wow-delay=".4s"
            />
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
          src="/assets/img/shapes/b3.svg"
          alt="Shape"
          width={120}
          height={120}
          className="bshape3 aniupDown position-absolute"
        />

        <Image
          src="/assets/img/shapes/b4.svg"
          alt="Shape"
          width={27}
          height={27}
          className="bshape4 anileftRight position-absolute"
        />
      </div>
    </section>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

const categoryKeys = [
  { key: "art", courses: 5, icon: "/assets/img/icons/category/1.svg", image: "/assets/img/category/1.jpg" },
  { key: "web", courses: 10, icon: "/assets/img/icons/category/2.svg", image: "/assets/img/category/2.jpg" },
  { key: "finance", courses: 6, icon: "/assets/img/icons/category/3.svg", image: "/assets/img/category/3.jpg" },
  { key: "marketing", courses: 3, icon: "/assets/img/icons/category/4.svg", image: "/assets/img/category/4.jpg" },
  { key: "mobile", courses: 8, icon: "/assets/img/icons/category/5.svg", image: "/assets/img/category/5.jpg" },
  { key: "data", courses: 4, icon: "/assets/img/icons/category/6.svg", image: "/assets/img/category/6.jpg" },
  { key: "marketing2", courses: 3, icon: "/assets/img/icons/category/7.svg", image: "/assets/img/category/7.jpg" },
  { key: "health", courses: 8, icon: "/assets/img/icons/category/8.svg", image: "/assets/img/category/8.jpg" },
  { key: "animation", courses: 4, icon: "/assets/img/icons/category/1.svg", image: "/assets/img/category/9.jpg" },
];

export default function CourseCategory() {
  const { t } = useI18n();

  return (
    <section className="course-category section-padding">
      <div className="container">
        <div className="row">
          {categoryKeys.map((category, index) => {
            const title = t(`category.items.${category.key}`);
            return (
            <div
              className="col-xl-4 col-md-6 col-12 wow fadeInUp"
              key={index}
            >
              <div className="category-item">
                <div className="cicon">
                  <Image
                    src={category.icon}
                    alt={title}
                    width={35}
                    height={35}
					className="d-inline-block"
                  />
                </div>

                <h3>{title}</h3>
                <div className="category-foot">
                  <span>{t("category.coursesCount", { count: category.courses })}</span>
                  <Link href="/courses" className="cbtn">
                    <i className="ph ph-arrow-right"></i>
                  </Link>
                </div>

                <div
                  className="cat_img"
                  style={{
                    backgroundImage: `url('${category.image}')`,
                  }}
                />
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
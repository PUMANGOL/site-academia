"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Blog() {
  const { t } = useI18n();
  const blogs = [
    { image: "/assets/img/blog/1.jpg", titleKey: "blogPage.p1" },
    { image: "/assets/img/blog/2.jpg", titleKey: "blogPage.p6" },
    { image: "/assets/img/blog/3.jpg", titleKey: "blogPage.p2" },
    { image: "/assets/img/blog/2.jpg", titleKey: "blogPage.p3" },
    { image: "/assets/img/blog/1.jpg", titleKey: "blogPage.p4" },
    { image: "/assets/img/blog/3.jpg", titleKey: "blogPage.p5" },
  ];

  return (
    <section className="blog section-padding">
      <div className="container">
        <div className="row">
          {blogs.map((blog, index) => (
            <div
              className="col-xl-4 col-md-6 col-12 wow fadeInUp"
              key={index}
            >
              <div className="blog_item">
                <div className="blog_img">
                  <Image
                    src={blog.image}
                    alt={t(blog.titleKey)}
                    width={978}
                    height={714}
                  />

                  <span className="b_cat">
                    <Link href="#">
                      <i className="ph ph-file"></i> {t("blogPage.software")}
                    </Link>
                  </span>
                </div>

                <div className="blog_content">
                  <div className="blog_meta">
                    <span>
                      <i className="ph ph-user"></i> Masum Billah
                    </span>

                    <span>
                      <i className="ph ph-clock"></i> {t("blog.date")}
                    </span>
                  </div>

                  <h3>
                    <Link href="/blog-details">{t(blog.titleKey)}</Link>
                  </h3>

                  <Link href="/blog-details" className="blog_btn">
                    {t("features.learnMore")} <i className="ph ph-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <div className="col-12 text-center wow fadeInUp">
            <div className="post_pagination">
              <ul>
                <li>
                  <Link href="#">
                    <i className="ph ph-arrow-left"></i>
                  </Link>
                </li>
                <li>
                  <Link href="#">1</Link>
                </li>
                <li className="active">
                  <Link href="#">2</Link>
                </li>
                <li>
                  <Link href="#">3</Link>
                </li>
                <li>
                  <Link href="#">
                    <i className="ph ph-arrow-right"></i>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
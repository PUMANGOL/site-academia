"use client";

import Image from "next/image";
import Link from "next/link";
import Widget from '../template-parts/sidebarwidgets';
import { useI18n } from "@/app/i18n/I18nProvider";

export default function StandardBlog() {
  const { t } = useI18n();
  const blogs = [
    {
      image: "/assets/img/blog/3.jpg",
      category: t("blogPage.software"),
      author: "Masum Billah",
      date: t("blog.date"),
      title: t("blogPage.postTitle1"),
      description: t("blogPage.excerpt"),
    },
    {
      image: "/assets/img/blog/2.jpg",
      category: t("blogPage.software"),
      author: "Masum Billah",
      date: t("blog.date"),
      title: t("blogPage.postTitle2"),
      description: t("blogPage.excerpt"),
    },
  ];

  return (
    <section className="standard-blog section-padding">
      <div className="container">
        <div className="row">
          <div className="col-xl-8 col-lg-8 col-md-12 col-12 wow fadeIn">
            {blogs.map((blog, index) => (
              <div className="blog_item wow fadeInUp" key={index}>
                <div className="blog_img">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={978}
                    height={714}
                  />

                  <span className="b_cat">
                    <Link href="#">
                      <i className="ph ph-file"></i> {blog.category}
                    </Link>
                  </span>
                </div>

                <div className="blog_content">
                  <div className="blog_meta">
                    <span>
                      <i className="ph ph-user"></i> {blog.author}
                    </span>

                    <span>
                      <i className="ph ph-clock"></i> {blog.date}
                    </span>
                  </div>

                  <h2>
                    <Link href="/blog-details">{blog.title}</Link>
                  </h2>

                  <p>{blog.description}</p>

                  <Link href="/blog-details" className="blog_btn2">
                    <i className="ph ph-arrow-right"></i>
                  </Link>
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
          {/* End Col */}

           <div className="col-xl-4 col-lg-4 col-12 sidebar-area ">
                <Widget/>
           </div>
           {/* End Col */}
        </div>
      </div>
    </section>
  );
}
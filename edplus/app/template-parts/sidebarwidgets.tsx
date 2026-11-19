"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function BlogSidebar() {
  const { t } = useI18n();
  const categories = [
    t("widgets.cat1"),
    t("widgets.cat2"),
    t("widgets.cat3"),
    t("widgets.cat4"),
  ];
  const popularPosts = [
    { id: 1, image: "/assets/img/blog/1.jpg", title: t("blogPage.postTitle1") },
    { id: 2, image: "/assets/img/blog/2.jpg", title: t("blogPage.postTitle2") },
    { id: 3, image: "/assets/img/blog/3.jpg", title: t("blogPage.p1") },
  ];
  const tags = [
    t("widgets.tag1"),
    t("widgets.tag2"),
    t("widgets.tag3"),
    t("widgets.tag4"),
    t("widgets.tag5"),
    t("widgets.tag6"),
  ];

  return (
    <>
      {/* Search Widget */}
      <div className="widget search-widget wow fadeInUp">
        <div className="search-form">
          <form action="#" method="post">
            <input
              type="text"
              className="search-control"
              placeholder={t("widgets.search")}
            />

            <button type="submit" className="search-btn">
              <i className="ti-search"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Category Widget */}
      <div className="widget category-widget wow fadeInUp">
        <h3 className="widget-title">{t("widgets.category")}</h3>

        <ul>
          {categories.map((category) => (
            <li key={category}>
              <Link href="#">{category}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Posts */}
      <div className="widget popular-posts-widget wow fadeInUp">
        <h3 className="widget-title">{t("widgets.popular")}</h3>

        <ul>
          {popularPosts.map((post) => (
            <li key={post.id}>
              <Link href="/blog-details">
                <div className="float-start ppimage">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={90}
                    height={90}
                  />
                </div>

                <div className="ppcontent">
                  <h4>{post.title}</h4>
                  <span>{t("widgets.postDate")}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="widget popular-posts-widget wow fadeInUp">
        <h3 className="widget-title">{t("widgets.tags")}</h3>

        <div className="tags_clouds">
          {tags.map((tag) => (
            <Link href="#" key={tag}>
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
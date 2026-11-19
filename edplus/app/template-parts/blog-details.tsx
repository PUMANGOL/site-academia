"use client";

import Image from "next/image";
import Link from "next/link";

import Widget from '../template-parts/sidebarwidgets';
import { useI18n } from "@/app/i18n/I18nProvider";

export default function StandardBlog() {
  const { t } = useI18n();
  return (
    <section className="standard-blog section-padding">
      <div className="container">
        <div className="row">
          <div className="col-xl-8 col-lg-8 col-md-12 col-12 wow fadeIn">
            
                <div className="post-inner">
                    <div className="post-image">
                        <Image
                        src="/assets/img/blog/2.jpg"
                        alt="Post Image"
                        width={978}
                        height={714}
                        />
                    </div>

                    <div className="entry-content">
                        <p>
                        {t("blogPage.detailsText")}
                        </p>

                        <h2>{t("blogPage.detailsTitle")}</h2>

                        <p>
                        {t("blogPage.excerpt")}
                        </p>

                        <blockquote>
                        {t("blogPage.quote")}
                        </blockquote>
                    </div>

                    <div className="post-nav pnavigation">
                        <a href="#" className="prev-pro">
                        {t("blogPage.prev")}
                        </a>

                        <a href="#" className="next-pro">
                        {t("blogPage.next")}
                        </a>
                    </div>
                </div>

                <div className="comments">
                 <h2 className="bdtitle">{t("blogPage.comments")}</h2>

                    <ul className="comment-list">
                        <li className="comment">
                        <div className="single-comment">
                            <div className="float-start com-img">
                            <Image
                                src="/assets/img/review/1.jpg"
                                alt=""
                                width={80}
                                height={80}
                            />
                            <h4>
                                <a href="#">Mr Smith</a>
                            </h4>
                            <span className="cdate">{t("blogPage.commentDate")}</span>

                            <a href="#" className="creplay">
                                <i className="fa-solid fa-reply"></i>
                            </a>
                            </div>

                            <div className="com-content">
                            <p>
                                {t("blogPage.commentText")}
                            </p>
                            </div>
                        </div>
                        </li>

                        <li className="comment">
                        <ul className="children">
                            <li className="comment">
                            <div className="single-comment">
                                <div className="float-start com-img">
                                <Image
                                    src="/assets/img/review/2.png"
                                    alt=""
                                    width={80}
                                    height={80}
                                />
                                <h4>
                                    <a href="#">Mr Smith</a>
                                </h4>
                                <span className="cdate">{t("blogPage.commentDate")}</span>

                                <a href="#" className="creplay">
                                    <i className="fa-solid fa-reply"></i>
                                </a>
                                </div>

                                <div className="com-content">
                                <p>
                                    {t("blogPage.commentText")}
                                </p>
                                </div>
                            </div>

                            <ul className="children">
                                <li className="comment">
                                <div className="single-comment">
                                    <div className="float-start com-img">
                                    <Image
                                        src="/assets/img/review/3.png"
                                        alt=""
                                        width={80}
                                        height={80}
                                    />
                                    <h4>
                                        <a href="#">Mr Smith</a>
                                    </h4>
                                    <span className="cdate">{t("blogPage.commentDate")}</span>

                                    <a href="#" className="creplay">
                                        <i className="fa-solid fa-reply"></i>
                                    </a>
                                    </div>

                                    <div className="com-content">
                                    <p>
                                        {t("blogPage.commentText")}
                                    </p>
                                    </div>
                                </div>
                                </li>
                            </ul>
                            </li>
                        </ul>
                        </li>
                    </ul>
                </div>     

                <div className="comment-form">
                    <h2 className="bdtitle">{t("blogPage.comment")}</h2>

                    <form action="#" method="post">
                        <div className="d-flex name_email">
                        <p>
                            <label htmlFor="name">{t("blogPage.fullName")}</label>
                            <input
                            type="text"
                            id="name"
                            className="form-control"
                            name="name"
                            />
                        </p>

                        <p>
                            <label htmlFor="email">{t("blogPage.email")}</label>
                            <input
                            type="email"
                            id="email"
                            className="form-control"
                            name="email"
                            />
                        </p>
                        </div>

                        <p>
                        <label htmlFor="website">{t("blogPage.website")}</label>
                        <input
                            type="url"
                            id="website"
                            className="form-control"
                            name="website"
                        />
                        </p>

                        <p>
                        <label htmlFor="message">{t("blogPage.comment")}</label>
                        <textarea
                            id="message"
                            className="form-control"
                            name="comment"
                        ></textarea>
                        </p>

                        <p>
                        <input type="submit" id="submit" value={t("blogPage.submit")} />
                        </p>
                    </form>
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
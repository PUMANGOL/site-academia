"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function ProgramSection() {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState("all");
    const tabs = [
        { id: "all", label: t("programs.all") },
        { id: "graduate", label: t("programs.graduate") },
        { id: "undergraduate", label: t("programs.undergraduate") },
        { id: "online-program", label: t("programs.online") },
    ];
    const programs = [
        { id: 1, filter: ["graduate"], category: t("programs.c1"), image: "/assets/img/program/1.jpg", title: t("programs.p1"), description: t("programs.desc") },
        { id: 2, filter: ["graduate", "undergraduate"], category: t("programs.c2"), image: "/assets/img/program/2.jpg", title: t("programs.p2"), description: t("programs.desc") },
        { id: 3, filter: ["undergraduate"], category: t("programs.c3"), image: "/assets/img/program/3.jpg", title: t("programs.p3"), description: t("programs.desc") },
        { id: 4, filter: ["graduate", "undergraduate"], category: t("programs.c4"), image: "/assets/img/program/4.jpg", title: t("programs.p4"), description: t("programs.desc") },
        { id: 5, filter: ["online-program"], category: t("programs.c5"), image: "/assets/img/program/5.jpg", title: t("programs.p5"), description: t("programs.desc") },
        { id: 6, filter: ["online-program"], category: t("programs.c6"), image: "/assets/img/program/6.jpg", title: t("programs.p6"), description: t("programs.desc") },
    ];

    const filteredPrograms =
        activeTab === "all"
            ? programs
            : programs.filter((item) =>
                  item.filter.includes(activeTab)
              );

    return (
        <section className="our-program section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-12 text-center">
                        <div className="section-title wow fadeInUp">
                            <span>
                                <span className="ticon">
                                    <Image
                                        src="/assets/img/icons/title-icon.svg"
                                        alt=""
                                        width={20}
                                        height={20}
                                    />
                                </span>
                                {t("programs.eyebrow")}
                            </span>

                            <h2>
                                {t("programs.title")} <br />
                                {t("programs.title2")}
                            </h2>

                            <Image
                                src="/assets/img/shapes/title.svg"
                                alt=""
                                width={216}
                                height={19}
                                className="d-inline-block"
                            />
                        </div>

                        {/* Tabs */}
                        <ul className="prog_nav wow fadeInUp">
                            {tabs.map((tab) => (
                                <li
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={
                                        activeTab === tab.id
                                            ? "active"
                                            : ""
                                    }
                                >
                                    {tab.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="row gy-4 mt-2">
                    <AnimatePresence mode="wait">
                        {filteredPrograms.map((program) => (
                            <motion.div
                                key={`${activeTab}-${program.id}`}
                                layout
                                initial={{
                                    opacity: 0,
                                    y: 30,
                                    scale: 0.95,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -30,
                                    scale: 0.95,
                                }}
                                transition={{
                                    duration: 0.4,
                                    ease: "easeOut",
                                }}
                                className="col-xl-4 col-md-6 col-12"
                            >
                                <div className="program_item">
                                    <div className="program_img">
                                        <div className="pcat">
                                            <i className="fa-solid fa-graduation-cap"></i>{" "}
                                            <Link href="#">
                                                {program.category}
                                            </Link>
                                        </div>

                                        <Image
                                            src={program.image}
                                            alt={program.title}
                                            width={420}
                                            height={300}
                                        />
                                    </div>

                                    <div className="program_content">
                                        <div className="pauthor">
                                            <Image
                                                src="/assets/img/program/avatar.png"
                                                alt=""
                                                width={40}
                                                height={40}
                                            />

                                            <p>
                                                Prof.{" "}
                                                <span>
                                                    <Link href="#">
                                                        Masum Billah
                                                    </Link>
                                                </span>
                                            </p>
                                        </div>

                                        <h3>
                                            <Link href="/application-form">
                                                {program.title}
                                            </Link>
                                        </h3>

                                        <div className="prating">
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <span>(4.5 ratings)</span>
                                        </div>

                                        <p>{program.description}</p>

                                        <Link
                                            href="/application-form"
                                            className="pr_btn"
                                        >
                                            <i className="ph ph-arrow-right"></i>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

        </section>
    );
}
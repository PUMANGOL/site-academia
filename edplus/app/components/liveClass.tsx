"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function LiveClasses() {
	const { t } = useI18n();
	return (
		<section className="live-classes section-padding">
			<div className="container">
				<div className="section-title text-center wow fadeInUp">
					<span>{t("live.eyebrow")}</span>
					<h2>{t("live.title")}</h2>

					<Image
						src="/assets/img/shapes/title.svg"
						alt=""
						width={216}
						height={19}
                        className="d-inline-block"
					/>
				</div>

				<div className="row">
					<div className="col-xl-7 col-12 align-self-center wow fadeInUp">
						<div className="lclass_img">
							<Image
								src="/assets/img/live-class/1.jpg"
								className="lcmain_img"
								alt=""
								width={879}
								height={436}
							/>

							<Image
								src="/assets/img/shapes/live-class.svg"
								alt=""
								className="lclass_shape"
								width={35}
								height={150}
							/>
						</div>
					</div>

					<div className="col-xl-5 col-12 align-self-center wow fadeInUp">
						<div className="lclass_content">
							<Image
								src="/assets/img/shapes/wave.svg"
								className="lclass_wave_shape"
								alt=""
								width={107}
								height={11}
							/>

							<div className="lc_author">
								<Image
									src="/assets/img/courses/author/1.png"
									alt=""
									width={33}
									height={33}
                                    className="d-inline-block"
								/>

								<Link href="#">
									Ana Ferreira
								</Link>
							</div>

							<h3>
								<Link href="#">
									{t("banner.courseTitle")}
								</Link>
							</h3>

							<div className="lc_rating">
								<i className="fa-solid fa-star"></i>
								<i className="fa-solid fa-star"></i>
								<i className="fa-solid fa-star"></i>
								<i className="fa-solid fa-star"></i>
								<i className="fa-solid fa-star"></i>
								<span>4.8</span>
							</div>

							<div className="lc_btm d-flex gap-5">
								<div className="lc_btm_left align-self-center">
									<span>{t("live.onlineStudents")}</span>

									<Image
										src="/assets/img/live-class/avator.png"
										alt=""
										width={150}
										height={50}
									/>
								</div>

								<div className="lc_btm_right align-self-center">
									<Link
										href="#"
										className="border_btn"
									>
										<i className="ph ph-video-camera"></i>
										{" "}{t("live.joinNow")}{" "}
										<i className="ph ph-arrow-right iright"></i>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
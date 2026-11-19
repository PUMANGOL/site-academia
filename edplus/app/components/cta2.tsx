"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function CTASection() {
	const { t } = useI18n();
	return (
		<section className="container pb100">
			<div
				className="cta"
				style={{
					backgroundImage: "url(/assets/img/cta/bg.jpg)",
				}}
			>
				<div className="row justify-content-end">
					<div className="col-xl-6 wow fadeInUp">
						<div className="cta-content">
							<span>{t("ctaBanner.eyebrow")}</span>

							<h2>
								{t("ctaBanner.title")}
							</h2>

							<Link href="/register" className="white_btn">
								{t("cta.apply")}{" "}
								<i className="ph ph-arrow-right"></i>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
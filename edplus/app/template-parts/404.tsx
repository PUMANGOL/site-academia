"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function ErrorPage() {
	const { t } = useI18n();

	return (
		<section className="page_not_found section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-7 mx-auto text-center wow fadeIn">
						<Image
							src="/assets/img/404.jpg"
							alt="404"
							width={800}
							height={500}
						/>
						<h2>{t("notFound.title")}</h2>
						<p>{t("notFound.text")}</p>
						<Link href="/" className="blue_btn round_btn py40">
							<i className="ph ph-house-line"></i> {t("notFound.back")}
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

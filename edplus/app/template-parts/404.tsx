"use client";

import Link from "next/link";
import { brandImages } from "@/app/data/brand-images";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function ErrorPage() {
	const { t } = useI18n();

	return (
		<section className="page_not_found section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-7 mx-auto text-center wow fadeIn">
						{/* Símbolo oficial (os dois arcos), 505×321: versão a cores no tema claro, negativa no escuro. */}
						<svg
							width="189"
							height="120"
							viewBox="0 0 505 321"
							aria-hidden="true"
							className="d-inline-block mb-5"
						>
							<image
								href={brandImages.symbolColor}
								width="505"
								height="321"
								className="logo-light"
							/>
							<image
								href={brandImages.symbolWhite}
								width="505"
								height="321"
								className="logo-dark"
							/>
						</svg>
						<h2>{t("notFound.title")}</h2>
						<p>{t("notFound.text")}</p>
						<Link href="/" className="blue_btn round_btn btn-brand-dark py40">
							<i className="ph ph-house-line"></i> {t("notFound.back")}
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

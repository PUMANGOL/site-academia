"use client";

import { useState } from "react";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function FAQPage() {
	const { t } = useI18n();
	const [active, setActive] = useState<number | null>(0);

	const faqs = [
		{ title: t("faq.q1"), content: t("faq.a1") },
		{ title: t("faq.q2"), content: t("faq.a2") },
		{ title: t("faq.q3"), content: t("faq.a3") },
		{ title: t("faq.q4"), content: t("faq.a4") },
		{ title: t("faq.q5"), content: t("faq.a5") },
	];

	const toggleAccordion = (index: number) => {
		setActive((prev) => (prev === index ? null : index));
	};

	return (
		<section className="faq section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-8 mx-auto wow fadeIn">
						<div className="accordion" id="faq_accordion">
							{faqs.map((faq, index) => (
								<div className="accordion-item" key={index}>
									<h2 className="accordion-header">
										<button
											className={`accordion-button ${
												active !== index ? "collapsed" : ""
											}`}
											type="button"
											onClick={() => toggleAccordion(index)}
										>
											{faq.title}
										</button>
									</h2>
									<div className={`accordion-collapse ${active === index ? "show" : ""}`}>
										<div className="accordion-body">{faq.content}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

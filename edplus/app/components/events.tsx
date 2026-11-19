"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Events() {
	const { t } = useI18n();
	const eventsData = [
	{
		id: 1,
		image: "/assets/img/events/1.jpg",
		date: "9 Jan 2026",
		title: t("eventsPage.e1"),
		time: "11:00 AM- 08:00 PM",
		location: t("eventsPage.locationUs"),
	},
	{
		id: 2,
		image: "/assets/img/events/2.jpg",
		date: "9 Jan 2026",
		title: t("eventsPage.e2"),
		time: "11:00 AM- 08:00 PM",
		location: t("eventsPage.locationUs"),
	},
	{
		id: 3,
		image: "/assets/img/events/3.jpg",
		date: "9 Jan 2026",
		title: t("eventsPage.e3"),
		time: "11:00 AM- 08:00 PM",
		location: t("eventsPage.locationUs"),
	},
	{
		id: 4,
		image: "/assets/img/events/4.jpg",
		date: "9 Jan 2026",
		title: t("eventsPage.e4"),
		time: "11:00 AM- 08:00 PM",
		location: t("eventsPage.locationUs"),
	},
];
	return (
		<>
			{/* Start Events */}
			<section className="events section-padding">
				<div className="container">
					<div className="section-title text-center wow fadeInUp">
						<span>{t("eventsHome.eyebrow")}</span>
						<h2>
							{t("eventsHome.title")}
							<br />
							{t("eventsHome.title2")}
						</h2>
						<img
							src="/assets/img/shapes/title.svg"
							alt=""
                            className="d-inline-block"
						/>
					</div>

					<div className="row">
						{eventsData.map((event, index) => (
							<motion.div
								key={event.id}
								className="col-xl-6 col-md-12"
								initial={{
									opacity: 0,
									y: 30,
									scale: 0.98,
								}}
								whileInView={{
									opacity: 1,
									y: 0,
									scale: 1,
								}}
								viewport={{ once: true }}
								transition={{
									duration: 0.5,
									delay: index * 0.1,
								}}
							>
								<div className="events_item">
									<img
										src={event.image}
										alt={event.title}
									/>

									<div className="event_content">
										<span className="evn_date">
											{event.date}
										</span>

										<h3>
											<Link href='/event-details'>
												{event.title}
											</Link>
										</h3>

										<div className="evn_meta">
											<span>
												<i className="fa-regular fa-clock"></i>{" "}
												{event.time}
											</span>

											<span>
												<i className="fa-solid fa-location-dot"></i>{" "}
												{event.location}
											</span>
										</div>
									</div>

									<Link
										href='/event-details'
										className="event_btn"
									>
										<i className="ph ph-arrow-right"></i>
									</Link>
								</div>
							</motion.div>
						))}

						<div className="col-12 text-center mt-4 wow fadeInUp">
							<Link href="/events" className="blue_btn">
								{t("eventsHome.viewMore")}{" "}
								<i className="ph ph-arrow-right"></i>
							</Link>
						</div>
					</div>
				</div>
			</section>
			{/* End Events */}
		</>
	);
}
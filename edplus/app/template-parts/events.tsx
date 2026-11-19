"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function EventList() {
  const { t } = useI18n();
  const events = [
    { id: 1, image: "/assets/img/events/1.jpg", date: "9 Jan 2024", title: t("eventsPage.e1"), time: "11:00 AM - 08:00 PM", location: t("eventsPage.locationUs") },
    { id: 2, image: "/assets/img/events/2.jpg", date: "9 Jan 2024", title: t("eventsPage.e2"), time: "11:00 AM - 08:00 PM", location: t("eventsPage.locationUs") },
    { id: 3, image: "/assets/img/events/3.jpg", date: "9 Jan 2024", title: t("eventsPage.e3"), time: "11:00 AM - 08:00 PM", location: t("eventsPage.locationUs") },
    { id: 4, image: "/assets/img/events/4.jpg", date: "9 Jan 2024", title: t("eventsPage.e4"), time: "11:00 AM - 08:00 PM", location: t("eventsPage.locationUs") },
    { id: 5, image: "/assets/img/events/3.jpg", date: "16 Feb 2024", title: t("eventsPage.e5"), time: "10:00 AM - 06:00 PM", location: t("eventsPage.locationCa") },
    { id: 6, image: "/assets/img/events/2.jpg", date: "12 Mar 2024", title: t("eventsPage.e6"), time: "09:00 AM - 05:00 PM", location: t("eventsPage.locationUk") },
    { id: 7, image: "/assets/img/events/1.jpg", date: "28 Apr 2024", title: t("eventsPage.e7"), time: "01:00 PM - 09:00 PM", location: t("eventsPage.locationAu") },
    { id: 8, image: "/assets/img/events/4.jpg", date: "10 May 2024", title: t("eventsPage.e8"), time: "11:00 AM - 07:00 PM", location: t("eventsPage.locationDe") },
  ];

  return (
    <section className="events section-padding">
      <div className="container">
    
        <div className="row">
          {events.map((event) => (
            <div
              className="col-xl-6 col-md-12 wow fadeInUp"
              key={event.id}
            >
              <div className="events_item">
                <Image
                  src={event.image}
                  alt={event.title}
                  width={690}
                  height={430}
                />

                <div className="event_content">
                  <span className="evn_date">{event.date}</span>

                  <h3>
                    <Link href="#">
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

                <Link href="#" className="event_btn">
                  <i className="ph ph-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
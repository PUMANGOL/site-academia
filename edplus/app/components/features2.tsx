"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function Features2() {
  const { t } = useI18n();
  return (
    <section className="features section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-12">
            <div className="feature_item fi_single wow">
              <div className="ficon">
                <Image
                  src="/assets/img/features/1.svg"
                  alt="Learning Experiences"
                  width={80}
                  height={80}
                />
              </div>

              <h3>{t("features.why")}</h3>

              <p>
                {t("features.desc")}
              </p>

              <Link href="#">
                {t("features.learnMore")}..
              </Link>
            </div>
          </div>
          {/* End Col */}

          <div className="col-lg-4 col-12">
            <div className="feature_item fi_single wow">
              <div className="ficon">
                <Image
                  src="/assets/img/features/2.svg"
                  alt="Professional Instructor"
                  width={80}
                  height={80}
                />
              </div>

              <h3>{t("features.lecturers")}</h3>

              <p>
                {t("features.desc")}
              </p>

              <Link href="#">
                {t("features.learnMore")}..
              </Link>
            </div>
          </div>
          {/* End Col */}

          <div className="col-lg-4 col-12">
            <div className="feature_item fi_single wow">
              <div className="ficon">
                <Image
                  src="/assets/img/features/3.svg"
                  alt="Life Time Support"
                  width={80}
                  height={80}
                />
              </div>

              <h3>{t("about.item6")}</h3>

              <p>
                {t("features.desc")}
              </p>

              <Link href="#">
                {t("features.learnMore")}..
              </Link>
            </div>
          </div>
          {/* End Col */}
        </div>
      </div>
    </section>
  );
}
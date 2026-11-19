"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestCatalog } from "@/app/actions/catalog-request";
import BrandMark from "@/app/components/brand-mark";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function FutureCta({ data }: { data?: BlockData }) {
	const { text } = useBlockContent("futureCta", data);
	const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
	const [error, setError] = useState("");
	const image = text("image");

	async function onCatalog(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
		if (!email || status === "sending") return;
		setStatus("sending");
		setError("");
		const result = await requestCatalog({ email });
		if (result.ok) {
			setStatus("sent");
			return;
		}
		setStatus("error");
		setError(result.error);
	}

	return (
		<section className="ap-future">
			{image ? (
				<Image
					src={image}
					alt=""
					fill
					sizes="100vw"
					className="ap-future-bg"
					unoptimized={isExternal(image)}
				/>
			) : null}
			<div className="container">
				<div className="ap-future-inner sec-in">
					<div className="section-title mb-0">
						<span className="ap-on-dark">
							<BrandMark variant="dark" />
							{text("eyebrow")}
						</span>
					</div>
					<h2>
						{text("title")} <span className="ap-hl-lime">{text("highlight")}</span>
					</h2>
					<p>{text("text")}</p>
					<div className="ap-future-actions">
						<Link href={text("buttonHref") || "/#contacto"} className="blue_btn round_btn">
							{text("buttonLabel")}
							<i className="ph ph-arrow-right" aria-hidden />
						</Link>
						{/* <Link href={text("programsHref") || "/courses"} className="btn-brand-ghost">
							{text("programsLabel")}
						</Link> */}
					</div>
					<form className="ap-catalog" onSubmit={onCatalog}>
						<span>{text("catalogLabel")}</span>
						<label className="visually-hidden" htmlFor="ap-catalog-email">
							{text("emailPlaceholder")}
						</label>
						<input
							id="ap-catalog-email"
							className="fld fld-d"
							type="email"
							name="email"
							required
							placeholder={text("emailPlaceholder")}
						/>
						<button type="submit" className="blue_btn round_btn" disabled={status === "sending" || status === "sent"}>
							{status === "sending"
								? text("catalogSending")
								: status === "sent"
									? text("catalogSent")
									: text("catalogCta")}
						</button>
						{status === "error" ? <p className="ap-catalog-status">{error || text("catalogError")}</p> : null}
						{status === "sent" ? <p className="ap-catalog-status">{text("catalogSentDetail")}</p> : null}
					</form>
					<p className="ap-future-soon">
						<strong>{text("soon")}</strong> {text("soonText")}{" "}
						<Link href={text("notifyHref") || "/#contacto"}>{text("notify")}</Link>
					</p>
				</div>
			</div>
		</section>
	);
}

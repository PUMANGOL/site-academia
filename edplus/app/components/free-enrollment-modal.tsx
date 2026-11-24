"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enrollInFreeCourse } from "@/app/actions/enrollments";
import { useI18n } from "@/app/i18n/I18nProvider";

type Step =
	| { name: "confirm"; error?: string }
	| { name: "submitting" }
	| { name: "done"; alreadyEnrolled: boolean; email: string };

// Montar só quando aberto: cada abertura começa de novo no passo de confirmação.
type FreeEnrollmentModalProps = {
	onClose: () => void;
	// Chamado quando a inscrição fica registada (ou já existia).
	onEnrolled?: () => void;
	course: { id: string; slug: string; title: string; details?: string };
};

// Confirmação da inscrição num curso gratuito e aviso de que o email vai seguir.
export default function FreeEnrollmentModal({
	onClose,
	onEnrolled,
	course,
}: FreeEnrollmentModalProps) {
	const { t } = useI18n();
	const router = useRouter();
	const [step, setStep] = useState<Step>({ name: "confirm" });
	const submitting = step.name === "submitting";

	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	useEffect(() => {
		if (submitting) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [submitting, onClose]);

	if (typeof document === "undefined") return null;

	async function handleConfirm() {
		setStep({ name: "submitting" });
		const result = await enrollInFreeCourse(course.id);
		if (result.ok) {
			setStep({ name: "done", alreadyEnrolled: result.alreadyEnrolled, email: result.email });
			onEnrolled?.();
		} else if (result.requiresLogin) {
			router.push(`/login?redirect=${encodeURIComponent(`/courses/${course.slug}`)}`);
		} else {
			setStep({ name: "confirm", error: result.error });
		}
	}

	const quotedTitle = `“${course.title}”`;

	return createPortal(
		<>
			<div
				className="site-modal-backdrop"
				onClick={submitting ? undefined : onClose}
				aria-hidden
			/>
			<div
				className="site-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="free-enrollment-title"
			>
				<div className="site-modal-content">
					{step.name === "done" ? (
						<div className="site-modal-body text-center">
							<i
								className={`ph ${step.alreadyEnrolled ? "ph-info" : "ph-check-circle"} site-modal-icon is-success`}
								aria-hidden
							/>
							<h3 id="free-enrollment-title" className="site-modal-title">
								{step.alreadyEnrolled
									? t("freeEnrollment.alreadyTitle")
									: t("freeEnrollment.successTitle")}
							</h3>
							<p>
								{step.alreadyEnrolled
									? t("freeEnrollment.alreadyText", { title: quotedTitle })
									: t("freeEnrollment.successText", { title: quotedTitle })}
							</p>
							{step.alreadyEnrolled ? null : (
								<p className="site-modal-note">
									<i className="ph ph-envelope-simple" aria-hidden />{" "}
									{t("freeEnrollment.successEmail", { email: step.email })}
								</p>
							)}
							<div className="site-modal-actions justify-content-center">
								<button
									type="button"
									className="border_btn round_btn"
									onClick={onClose}
								>
									{t("freeEnrollment.close")}
								</button>
								<Link href="/aluno/cursos" className="blue_btn round_btn btn-brand-dark">
									{t("courseDetails.goToMyCourses")}
								</Link>
							</div>
						</div>
					) : (
						<div className="site-modal-body">
							<h3 id="free-enrollment-title" className="site-modal-title">
								{t("freeEnrollment.confirmTitle")}
							</h3>
							<p className="mb-2">{t("freeEnrollment.confirmText")}</p>
							<p className="site-modal-course">
								<strong>{course.title}</strong>
								{course.details ? <span>{course.details}</span> : null}
							</p>
							<p className="site-modal-note">{t("freeEnrollment.confirmNote")}</p>
							{step.name === "confirm" && step.error ? (
								<p className="mb-0" style={{ color: "var(--ap-red-text)" }}>{step.error}</p>
							) : null}
							<div className="site-modal-actions">
								<button
									type="button"
									className="border_btn round_btn"
									onClick={onClose}
									disabled={submitting}
								>
									{t("freeEnrollment.cancel")}
								</button>
								<button
									type="button"
									className="blue_btn round_btn btn-brand-dark"
									onClick={handleConfirm}
									disabled={submitting}
								>
									{submitting ? t("freeEnrollment.submitting") : t("freeEnrollment.confirm")}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</>,
		document.body
	);
}

"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";

type AdminModalProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	footer?: ReactNode;
	size?: "md" | "lg" | "xl";
};

export default function AdminModal({
	open,
	onClose,
	title,
	children,
	footer,
	size = "md",
}: AdminModalProps) {
	if (!open || typeof document === "undefined") return null;

	return createPortal(
		<>
			<div className="admin-modal-backdrop" onClick={onClose} aria-hidden />
			<div className="admin-modal" role="dialog" aria-modal="true">
				<div
					className={`admin-modal-dialog${size !== "md" ? ` admin-modal-dialog-${size}` : ""}`}
				>
					<div className="admin-modal-content">
						<div className="admin-modal-header">
							<h3 className="admin-modal-title">{title}</h3>
							<button
								type="button"
								className="admin-modal-close"
								onClick={onClose}
								aria-label="Fechar"
							>
								&times;
							</button>
						</div>
						<div className="admin-modal-body">{children}</div>
						{footer ? <div className="admin-modal-footer">{footer}</div> : null}
					</div>
				</div>
			</div>
		</>,
		document.getElementById("admin-portal-root") ?? document.body
	);
}

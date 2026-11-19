"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";

type AdminDropdownProps = {
	trigger: ReactNode;
	children: ReactNode;
	align?: "start" | "end";
};

export function AdminDropdown({
	trigger,
	children,
	align = "end",
}: AdminDropdownProps) {
	const [open, setOpen] = useState(false);
	const [rect, setRect] = useState<DOMRect | null>(null);
	const triggerRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!open || !triggerRef.current) return;
		setRect(triggerRef.current.getBoundingClientRect());
	}, [open]);

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			const target = event.target as Node;
			if (triggerRef.current?.contains(target)) return;
			if (menuRef.current?.contains(target)) return;
			setOpen(false);
		};

		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, []);

	useEffect(() => {
		if (!open) return;
		const close = () => setOpen(false);
		window.addEventListener("scroll", close, true);
		window.addEventListener("resize", close);
		return () => {
			window.removeEventListener("scroll", close, true);
			window.removeEventListener("resize", close);
		};
	}, [open]);

	return (
		<div ref={triggerRef} className="admin-dropdown">
			<div onClick={() => setOpen((value) => !value)}>{trigger}</div>
			{open && rect && typeof document !== "undefined"
				? createPortal(
						<div
							ref={menuRef}
							className="admin-dropdown-menu"
							role="menu"
							style={{
								top: rect.bottom + 4,
								...(align === "end"
									? { right: window.innerWidth - rect.right }
									: { left: rect.left }),
							}}
						>
							{children}
						</div>,
						document.getElementById("admin-portal-root") ?? document.body
					)
				: null}
		</div>
	);
}

export function AdminDropdownLabel({
	title,
	subtitle,
}: {
	title: string;
	subtitle?: string;
}) {
	return (
		<div className="admin-dropdown-label">
			<strong>{title}</strong>
			{subtitle ? <span>{subtitle}</span> : null}
		</div>
	);
}

export function AdminDropdownSeparator() {
	return <div className="admin-dropdown-separator" role="separator" />;
}

type AdminDropdownItemProps = {
	children: ReactNode;
	onSelect?: () => void;
	disabled?: boolean;
	danger?: boolean;
	href?: string;
};

export function AdminDropdownItem({
	children,
	onSelect,
	disabled,
	danger,
	href,
}: AdminDropdownItemProps) {
	const className = `admin-dropdown-item${danger ? " is-danger" : ""}`;

	if (href) {
		return (
			<Link href={href} className={className} role="menuitem">
				{children}
			</Link>
		);
	}

	return (
		<button
			type="button"
			className={className}
			role="menuitem"
			disabled={disabled}
			onClick={onSelect}
		>
			{children}
		</button>
	);
}

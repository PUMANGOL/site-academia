"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarContextValue = {
	open: boolean;
	toggle: () => void;
	close: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarShellProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);

	return (
		<SidebarContext.Provider
			value={{
				open,
				toggle: () => setOpen((value) => !value),
				close: () => setOpen(false),
			}}
		>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebarShell() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebarShell must be used within SidebarShellProvider");
	}
	return context;
}

export function SidebarMenuToggle() {
	const { toggle } = useSidebarShell();
	return (
		<button
			type="button"
			className="admin-menu-toggle"
			onClick={toggle}
			aria-label="Abrir menu"
		>
			<i className="ph ph-list" aria-hidden />
		</button>
	);
}

export function SidebarBackdrop() {
	const { open, close } = useSidebarShell();
	if (!open) return null;
	return <div className="admin-sidebar-backdrop" onClick={close} aria-hidden />;
}

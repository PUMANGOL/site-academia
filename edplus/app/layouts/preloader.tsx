"use client";

import { useEffect, useState } from "react";
import SiteLogo from "@/app/components/site-logo";

export default function Preloader() {
	const [visible, setVisible] = useState(true);
	const [leaving, setLeaving] = useState(false);

	useEffect(() => {
		const hide = setTimeout(() => setLeaving(true), 1600);
		return () => clearTimeout(hide);
	}, []);

	useEffect(() => {
		if (!leaving) return;
		const gone = setTimeout(() => setVisible(false), 420);
		return () => clearTimeout(gone);
	}, [leaving]);

	if (!visible) return null;

	return (
		<div
			className={`preloader_wrap ap-loader${leaving ? " is-out" : ""}`}
			role="status"
			aria-live="polite"
			aria-label="A carregar"
		>
			<div aria-hidden="true">
				<SiteLogo height={62} inverted priority className="ap-loader-logo" />
			</div>
		</div>
	);
}

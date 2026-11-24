import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";

import "./globals.css";

// Vendor CSS
import "@/public/assets/bootstrap/css/bootstrap.min.css";
import "@/public/assets/fonts/themify-icons.css";
import "@/public/assets/fonts/fontawesome/css/all.css";
import "@/public/assets/css/line-awesome.css";
import "@/public/assets/css/animate.css";
import "@/public/assets/css/style.css";
import "@/public/assets/css/responsive.css";
import "@/public/assets/bootstrap/css/academia.css";
import AboutVideoEngine from "./components/about-video-engine";
import ChatFab from "./layouts/chat-fab";
import CursorLine from "./components/cursor-line";
import { InlineScript } from "./components/inline-script";
import Preloader from "./layouts/preloader";
import { I18nProvider } from "./i18n/I18nProvider";
import { CartProvider } from "./providers/cart-provider";
import { ThemeProvider } from "./providers/theme-provider";

// Applied before first paint so the saved theme never flashes the wrong palette.
const themeBootstrap = `(function(){try{var t=localStorage.getItem("academia-theme");if(t!=="light"&&t!=="dark"){t="light"}var r=document.documentElement;r.dataset.theme=t;r.dataset.bsTheme=t;r.style.colorScheme=t}catch(e){}})();`;

const montserrat = Montserrat({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-montserrat",
});

export const metadata: Metadata = {
	title: "Academia Pumangol",
	description: "Academia Pumangol",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="pt"
			data-bs-theme="light"
			data-theme="light"
			className={montserrat.variable}
			suppressHydrationWarning
		>
			<head>
				<InlineScript html={themeBootstrap} />

				<link
					href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
					rel="stylesheet"
				/>
				<link
					rel="stylesheet"
					href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"
				/>
			</head>

			<body>
				<Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
				<Preloader />
				<ThemeProvider>
					<I18nProvider>
						<CartProvider>
							{children}
							<AboutVideoEngine />
							<CursorLine />
							<ChatFab />
						</CartProvider>
					</I18nProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}

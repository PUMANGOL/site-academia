import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/app/backoffice/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = {
	title: "Login — Backoffice Academia Pumangol",
};

export default async function BackofficeLoginPage() {
	const session = await getAdminSession();
	if (session) redirect("/backoffice");

	return (
		<Suspense fallback={<div className="p-5 text-center">A carregar...</div>}>
			<AdminLoginForm />
		</Suspense>
	);
}

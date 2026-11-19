import { redirect } from "next/navigation";

// Página de demonstração do template: os perfis reais estão em /instructors/[slug].
export default function InstructorDetailsLegacyPage() {
	redirect("/instructors");
}
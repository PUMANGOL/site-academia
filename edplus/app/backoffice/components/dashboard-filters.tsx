"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
	AdminFilterBar,
	AdminFilterDateRange,
	AdminFilterSelect,
	type DateRangeValue,
	type FilterOption,
} from "@/app/backoffice/components/admin-filters";
import type { DashboardPeriod } from "@/db/queries/admin";

const periodOptions: { value: DashboardPeriod; label: string }[] = [
	{ value: "7d", label: "Últimos 7 dias" },
	{ value: "30d", label: "Últimos 30 dias" },
	{ value: "90d", label: "Últimos 90 dias" },
	{ value: "12m", label: "Últimos 12 meses" },
	{ value: "all", label: "Todo o período" },
	{ value: "custom", label: "Personalizado" },
];

type FilterState = {
	period: DashboardPeriod;
	dates: DateRangeValue;
	categoryId: string | null;
};

export default function DashboardFilters({
	period,
	dates,
	categoryId,
	categories,
}: FilterState & { categories: FilterOption[] }) {
	const router = useRouter();
	const pathname = usePathname();
	const [pending, startTransition] = useTransition();

	function apply(next: Partial<FilterState>) {
		const state = { period, dates, categoryId, ...next };
		const params = new URLSearchParams();
		if (state.period === "custom") {
			params.set("periodo", "custom");
			if (state.dates.from) params.set("de", state.dates.from);
			if (state.dates.to) params.set("ate", state.dates.to);
		} else if (state.period !== "all") {
			params.set("periodo", state.period);
		}
		if (state.categoryId) params.set("categoria", state.categoryId);
		const query = params.toString();

		startTransition(() => {
			router.replace(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		});
	}

	return (
		<div
			className={`admin-dashboard-filters${pending ? " admin-filter-pending" : ""}`}
		>
			<AdminFilterBar
				hasFilters={period !== "all" || categoryId !== null}
				onClear={() =>
					apply({ period: "all", dates: { from: "", to: "" }, categoryId: null })
				}
			>
				<AdminFilterSelect
					label="Período"
					value={period}
					onChange={(value) =>
						apply({
							period: value as DashboardPeriod,
							dates: { from: "", to: "" },
						})
					}
					options={periodOptions}
					allLabel={null}
				/>
				<AdminFilterDateRange
					label="Intervalo de datas"
					value={dates}
					onChange={(value) => apply({ period: "custom", dates: value })}
				/>
				<AdminFilterSelect
					label="Categoria"
					value={categoryId ?? ""}
					onChange={(value) => apply({ categoryId: value || null })}
					options={categories}
					allLabel="Todas"
				/>
			</AdminFilterBar>
		</div>
	);
}

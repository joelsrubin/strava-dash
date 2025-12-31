import { Notebook, Send, SquareTerminal } from "lucide-react";
import { useMemo } from "react";
import { NavMain } from "@/components/dashboard/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";

import type { Note } from "@/db";
import { useTheme } from "@/lib/theme";
import { getActivityMonth, getActivityYear } from "@/lib/utils";
import { NavSecondary } from "./nav-secondary";

// array of all hte months

export function AppSidebar({
	user,
	notes,
	...props
}: React.ComponentProps<typeof Sidebar> & { user: TAthlete; notes: Note[] }) {
	const { theme } = useTheme();
	const notesByYear = notes.reduce(
		(acc, note) => {
			const year = getActivityYear(note.activity_date);
			const month = getActivityMonth(note.activity_date);

			if (!acc[year]) {
				acc[year] = new Set();
			}
			acc[year].add(month);

			return acc;
		},
		{} as Record<string, Set<string>>,
	);
	const availableYears = Object.keys(notesByYear).sort((a, b) =>
		b.localeCompare(a),
	);

	const data = useMemo(
		() => ({
			navMain: [
				{
					title: "Activities",
					url: "/dashboard",
					icon: SquareTerminal,
				},
				{
					title: "Notes",
					url: "/dashboard/notes",
					icon: Notebook,
					items: availableYears.map((year) => {
						const monthsInYear = Array.from(notesByYear[year] || []);
						return {
							title: year,
							url: `/dashboard/notes?year=${year}`,
							items: monthsInYear.map((month) => ({
								title: month,
								url: `/dashboard/notes?year=${year}&month=${month}`,
							})),
						};
					}),
				},
			],
		}),
		[availableYears, notesByYear],
	);

	return (
		<Sidebar
			className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
			{...props}
		>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary
					className="mt-auto"
					items={[
						{
							title: "Feedback",
							url: "mailto:hello@notsofast.run",
							icon: Send,
						},
					]}
				/>
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center justify-center">
					<img
						className="w-40 pb-2"
						src={
							theme === "light"
								? "/powered-by-strava-light.png"
								: "/powered-by-strava.png"
						}
						alt="Powered by Strava"
					/>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}

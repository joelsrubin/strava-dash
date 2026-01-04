import { useSuspenseQuery } from "@tanstack/react-query";
import { Notebook, Send, SquareTerminal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";
import { NavMain } from "@/components/dashboard/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";

import { useTheme } from "@/lib/theme";
import { getActivityMonth, getActivityYear } from "@/lib/utils";
import { NavSecondary } from "./nav-secondary";

// array of all hte months

export function AppSidebar({
	user,

	...props
}: React.ComponentProps<typeof Sidebar> & { user: TAthlete }) {
	const { resolvedTheme } = useTheme();
	const { data: notes } = useSuspenseQuery(
		fetchNotesByStravaIdQueryOptions({ stravaId: user.id }),
	);
	const [imgUrl, setImgUrl] = useState("/powered-by-strava-light.png");
	useEffect(() => {
		setImgUrl(
			resolvedTheme === "light"
				? "/powered-by-strava-light.png"
				: "/powered-by-strava.png",
		);
	}, [resolvedTheme]);

	const notesByYear = notes.results.reduce(
		(acc, note) => {
			const year = getActivityYear(note.activity_date);
			const month = getActivityMonth(note.activity_date);

			if (!acc[year]) {
				acc[year] = {};
			}
			if (!acc[year][month]) {
				acc[year][month] = 0;
			}
			acc[year][month]++;

			return acc;
		},
		{} as Record<string, Record<string, number>>,
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
						const monthsInYear = Object.entries(notesByYear[year] || {});
						return {
							title: year,
							url: `/dashboard/notes?year=${year}`,
							items: monthsInYear.map(([month, count]) => ({
								title: month,
								url: `/dashboard/notes?year=${year}&month=${month}`,
								count,
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
					<img className="w-40 pb-2" src={imgUrl} alt="Powered by Strava" />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}

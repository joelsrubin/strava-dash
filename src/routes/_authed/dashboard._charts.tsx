import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import { Suspense } from "react";
import { z } from "zod";
import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";
import {
	fetchAthleteActivitiesAllQueryOptions,
	fetchAthleteActivitiesQueryOptions,
} from "@/api/queries/strava";
import { DistanceChart } from "@/components/charts/distance";
import { HeartRateChart } from "@/components/charts/heart-rate";
import ActivityHeatmap from "@/components/charts/heat-map";
import { ChartLoader } from "@/components/ui/loaders/chart-loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
	active_tab: z
		.enum(["activity-table", "notes-table"])
		.default("activity-table")
		.catch("activity-table"),
});

export const Route = createFileRoute("/_authed/dashboard/_charts")({
	component: RouteComponent,
	validateSearch: searchSchema,

	loader({ context: { queryClient, athlete } }) {
		queryClient.prefetchQuery(
			fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
		);
		queryClient.prefetchInfiniteQuery(fetchAthleteActivitiesQueryOptions());
		queryClient.prefetchQuery(fetchAthleteActivitiesAllQueryOptions());
	},
});

function RouteComponent() {
	const { isMobile } = useIsMobile();
	const { isLoading: isLoadingAllActivities } = useQuery(
		fetchAthleteActivitiesAllQueryOptions(),
	);
	const navigate = useNavigate({ from: "/dashboard/" });

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
			{!isMobile && (
				<div className="sm:grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3 hidden">
					<div className="bg-muted/50 rounded-xl">
						<h2 className="p-2 flex items-center gap-2">Distance</h2>
						<DistanceChart />
					</div>
					<div
						className={cn("bg-muted/50 rounded-xl", {
							"bg-transparent": isLoadingAllActivities,
						})}
					>
						<Suspense fallback={<ChartLoader />}>
							<h2 className="p-2 flex items-center gap-2">Heat Map</h2>
							<ActivityHeatmap />
						</Suspense>
					</div>
					<div className="bg-muted/50 rounded-xl hidden lg:block">
						<h2 className="p-2 flex items-center gap-2">Heart Rate</h2>
						<HeartRateChart />
					</div>
				</div>
			)}

			<Tabs
				defaultValue={Route.useSearch().active_tab}
				className="grid grid-rows-[auto_1fr] min-h-0 flex-1 gap-4"
			>
				<TabsList className="rounded-lg">
					<TabsTrigger
						className="rounded-lg"
						value="activity-table"
						onClick={() =>
							navigate({ search: { active_tab: "activity-table" } })
						}
					>
						Activities
					</TabsTrigger>
					<TabsTrigger
						className="rounded-lg"
						value="notes-table"
						onClick={() => navigate({ search: { active_tab: "notes-table" } })}
					>
						Notes
					</TabsTrigger>
				</TabsList>
				<Outlet />
			</Tabs>
		</div>
	);
}

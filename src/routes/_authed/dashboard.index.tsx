import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Suspense } from "react";

import {
	fetchAthleteActivitiesAllQueryOptions,
	fetchAthleteActivitiesQueryOptions,
} from "@/api/queries/strava";
import { DistanceChart } from "@/components/charts/distance";
import { HeartRateChart } from "@/components/charts/heart-rate";
import ActivityHeatmap from "@/components/charts/heat-map";

import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

import { DataTable } from "../../components/tables/activity-table";
import { PendingComponent } from "./-pending-component";
export const Route = createFileRoute("/_authed/dashboard/")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	pendingMs: 0,
	loader: ({ context: { queryClient } }) => {
		// Fire-and-forget prefetch - don't block navigation
		// queryClient.prefetchInfiniteQuery(fetchAthleteActivitiesQueryOptions());
		// queryClient.prefetchQuery(fetchAthleteActivitiesAllQueryOptions());
	},
});

function RouteComponent() {
	const { isMobile } = useIsMobile();

	const { isLoading: isLoadingAllActivities } = useQuery(
		fetchAthleteActivitiesAllQueryOptions(),
	);

	return (
		<SidebarInset className={"flex min-h-0 flex-1 flex-col"}>
			<div className={"flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"}>
				{!isMobile && (
					<div className="sm:grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3 hidden">
						<div className="bg-muted/50 rounded-xl">
							<h2 className="p-2 flex items-center gap-2">Distance</h2>
							<Suspense fallback={<ChartLoader />}>
								<DistanceChart />
							</Suspense>
						</div>
						<div
							className={`${isLoadingAllActivities ? "bg-transparent" : "bg-muted/50"} rounded-xl hidden lg:block`}
						>
							<Suspense fallback={<ChartLoader />}>
								<h2 className="p-2 flex items-center gap-2">Heat Map</h2>
								<ActivityHeatmap />
							</Suspense>
						</div>
						<div className="bg-muted/50 rounded-xl">
							<h2 className="p-2 flex items-center gap-2">Heart Rate</h2>
							<Suspense fallback={<ChartLoader />}>
								<HeartRateChart />
							</Suspense>
						</div>
					</div>
				)}

				<div className={"bg-muted/50 flex min-h-0 flex-1 flex-col rounded-xl"}>
					<Suspense fallback={<TableLoader />}>
						<DataTable />
					</Suspense>
				</div>
			</div>
		</SidebarInset>
	);
}

function ChartLoader() {
	return (
		<div className="flex flex-col gap-2 h-full">
			<Skeleton className="h-6 w-48 rounded-xl" />
			<div className="space-y-2 flex-1 flex flex-col">
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="flex-1 w-full rounded-xl" />
			</div>
		</div>
	);
}

function TableLoader() {
	return (
		<div className="flex flex-col gap-2 h-full">
			<Skeleton className="h-6 w-48 rounded-xl" />
			<div className="space-y-2 flex-1 flex flex-col">
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="flex-1 w-full rounded-xl" />
			</div>
		</div>
	);
}

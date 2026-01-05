import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { fetchAthleteActivitiesAllQueryOptions } from "@/api/queries/strava";
import { DistanceChart } from "@/components/charts/distance";
import { HeartRateChart } from "@/components/charts/heart-rate";
import ActivityHeatmap from "@/components/charts/heat-map";
import { SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChartLoader } from "./dashboard";

export const Route = createFileRoute("/_authed/dashboard/_charts")({
	component: RouteComponent,
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
							<DistanceChart />
						</div>
						<div
							className={`${isLoadingAllActivities ? "bg-transparent" : "bg-muted/50"} rounded-xl`}
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

				<div className={"bg-muted/50 flex min-h-0 flex-1 flex-col rounded-xl"}>
					<Outlet />
				</div>
			</div>
		</SidebarInset>
	);
}

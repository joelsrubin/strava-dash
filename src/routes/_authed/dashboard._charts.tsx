import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	stripSearchParams,
	useNavigate,
} from "@tanstack/react-router";

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

import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { ChartLoader } from "@/components/ui/loaders/chart-loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const defaultValues = {
	tab: "activity-table",
} as const;

const searchSchema = z.object({
	tab: z
		.enum(["activity-table", "notes-table"])
		.default(defaultValues.tab)
		.catch("activity-table"),
});

export const Route = createFileRoute("/_authed/dashboard/_charts")({
	component: RouteComponent,
	validateSearch: searchSchema,
	search: {
		middlewares: [stripSearchParams(defaultValues)],
	},
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
					<div
						className={cn("bg-muted/50 rounded-xl", {
							"bg-transparent": isLoadingAllActivities,
						})}
					>
						<h2 className="p-2 flex items-center gap-2">Weekly Distance</h2>
						<Suspense fallback={<ChartLoader />}>
							<DistanceChart />
						</Suspense>
					</div>
					<div
						className={cn("bg-muted/50 rounded-xl", {
							"bg-transparent": isLoadingAllActivities,
						})}
					>
						<h2 className="p-2 flex items-center gap-2">Heat Map</h2>
						<Suspense fallback={<ChartLoader />}>
							<ActivityHeatmap />
						</Suspense>
					</div>
					<div className="bg-muted/50 rounded-xl hidden lg:block">
						<h2 className="p-2 flex items-center gap-2">Effort</h2>
						<HeartRateChart />
					</div>
				</div>
			)}
			{/* This is a hack to provide a placeholder while `isMobile` inits on client */}
			{!isMobile && (
				<div
					className={cn("bg-muted/50 rounded-xl sm:hidden", {
						"bg-transparent": isLoadingAllActivities,
					})}
				>
					<h2 className="p-2 flex items-center gap-2">Weekly Distance</h2>
					<ChartLoader />
				</div>
			)}

			{isMobile && (
				<Carousel
					opts={{ loop: true }}
					className="w-full max-w-2xl flex justify-center items-center mx-auto"
				>
					<CarouselContent>
						<CarouselItem>
							<div
								className={cn("bg-muted/50 rounded-xl", {
									"bg-transparent": isLoadingAllActivities,
								})}
							>
								<h2 className="p-2 flex items-center gap-2">Weekly Distance</h2>
								<Suspense fallback={<ChartLoader />}>
									<DistanceChart />
								</Suspense>
							</div>
						</CarouselItem>

						<CarouselItem>
							<div
								className={cn("bg-muted/50 rounded-xl", {
									"bg-transparent": isLoadingAllActivities,
								})}
							>
								<h2 className="p-2 flex items-center gap-2">Heat Map</h2>
								<Suspense fallback={<ChartLoader />}>
									<ActivityHeatmap />
								</Suspense>
							</div>
						</CarouselItem>
						<CarouselItem>
							<div className="bg-muted/50 rounded-xl ">
								<h2 className="p-2 flex items-center gap-2">Effort</h2>
								<HeartRateChart />
							</div>
						</CarouselItem>
					</CarouselContent>
				</Carousel>
			)}
			<Tabs
				defaultValue={Route.useSearch().tab}
				className="grid grid-rows-[auto_1fr] min-h-0 flex-1 gap-4"
			>
				<TabsList className="rounded-lg">
					<TabsTrigger
						className="rounded-lg"
						value="activity-table"
						onClick={() => navigate({ search: { tab: "activity-table" } })}
					>
						Activities
					</TabsTrigger>
					<TabsTrigger
						className="rounded-lg"
						value="notes-table"
						onClick={() => navigate({ search: { tab: "notes-table" } })}
					>
						Notes
					</TabsTrigger>
				</TabsList>
				<Outlet />
			</Tabs>
		</div>
	);
}

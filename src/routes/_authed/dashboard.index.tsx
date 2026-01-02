import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid } from "recharts";
import {
	fetchAthleteActivitiesAllQueryOptions,
	fetchAthleteActivitiesQueryOptions,
} from "@/api/queries/strava";
import ActivityHeatmap from "@/components/charts/heat-map";
import { Button } from "@/components/ui/button";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPace } from "@/lib/utils";
import { DataTable } from "./-activity-table";
import { PendingComponent } from "./-pending-component";
export const Route = createFileRoute("/_authed/dashboard/")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: ({ context: { queryClient } }) => {
		// Fire-and-forget prefetch - don't block navigation
		queryClient.prefetchInfiniteQuery(fetchAthleteActivitiesQueryOptions());
		queryClient.prefetchQuery(fetchAthleteActivitiesAllQueryOptions());
	},
});

function RouteComponent() {
	const { isMobile } = useIsMobile();
	const {
		data: athleteActivities,
		fetchNextPage,
		isFetching,
		isFetchingNextPage,
	} = useSuspenseInfiniteQuery(fetchAthleteActivitiesQueryOptions());

	const { isLoading: isLoadingAllActivities } = useQuery(
		fetchAthleteActivitiesAllQueryOptions(),
	);
	const activitesToChart = athleteActivities.pages[0];

	const distanceData = useMemo(
		() =>
			activitesToChart
				.map((activity, index) => ({
					distance: activity.distance || activitesToChart[index - 1]?.distance,
				}))
				.reverse(),
		[activitesToChart],
	);

	const heartRateData = useMemo(
		() =>
			activitesToChart
				.map((activity, index) => ({
					heartRate:
						activity.average_heartrate ||
						activitesToChart[index - 1]?.average_heartrate,
				}))
				.reverse(),
		[activitesToChart],
	);

	const distanceConfig = useMemo<ChartConfig>(
		() => ({
			distance: {
				label: "Distance",
				color: "var(--primary)",
			},
		}),
		[],
	);

	const heartRateConfig = useMemo<ChartConfig>(
		() => ({
			heartRate: {
				label: "Heart Rate",
				color: "var(--primary)",
			},
		}),
		[],
	);

	const tableData = useMemo(
		() =>
			(athleteActivities.pages.flat() as TActivity[]).filter(
				(activity) => activity.type === "Run",
			),
		[athleteActivities.pages],
	);

	const columns: ColumnDef<TActivity>[] = useMemo(
		() => [
			{
				accessorKey: "start_date",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Date
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},

				cell: ({ row }) => {
					return (
						<div>{new Date(row.original.start_date).toLocaleDateString()}</div>
					);
				},
			},
			{
				accessorKey: "distance",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Distance
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},
				cell: ({ row }) => {
					return (
						<div>
							{((row.original.distance as number) * 0.00062137).toFixed(2)} mi
						</div>
					);
				},
			},
			{
				accessorKey: "average_speed",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Pace
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},

				cell: ({ row }) => {
					return <div>{formatPace(row.original.average_speed)} /mi</div>;
				},
			},
			{
				accessorKey: "moving_time",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Moving Time
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},
				meta: {
					className: "hidden lg:table-cell", // hidden on mobile
				},
				cell: ({ row }) => {
					if (!row.original.moving_time) return <div>no data</div>;
					if (row.original.moving_time > 3600) {
						// parse hours and minutes
						const hours = Math.floor(row.original.moving_time / 3600);
						const minutes = Math.floor((row.original.moving_time % 3600) / 60);
						return (
							<div>
								{hours}h {minutes}m
							</div>
						);
					}
					return <div>{(row.original.moving_time / 60).toFixed(0)} mins</div>;
				},
			},
			{
				accessorKey: "total_elevation_gain",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Total Elevation Gain
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},

				meta: {
					className: "hidden lg:table-cell", // hidden on mobile
				},
				cell: ({ row }) => {
					return <div>{row.original.total_elevation_gain.toFixed(0)} ft</div>;
				},
			},
			{
				accessorKey: "average_heartrate",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Average Heart Rate
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},
				meta: {
					className: "hidden md:table-cell", // hidden on mobile
				},
				cell: ({ row }) => {
					if (!row.original.average_heartrate) return <div>no data</div>;
					return <div>{row.original.average_heartrate.toFixed(0)} bpm</div>;
				},
			},
			{
				accessorKey: "kudos_count",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Kudos
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},
				meta: {
					className: "hidden md:table-cell", // hidden on mobile
				},
				cell: ({ row }) => {
					return <div>🎉 {row.original.kudos_count}</div>;
				},
			},

			{
				id: "actions",
				cell: ({ row }) => {
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>

								<DropdownMenuItem asChild>
									<Link
										to="/dashboard/run/$id"
										params={{ id: row.original.id.toString() }}
										preload="render"
									>
										View Run
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[],
	);

	return (
		<SidebarInset className={"flex min-h-0 flex-1 flex-col"}>
			<div className={"flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"}>
				{!isMobile && (
					<div className="sm:grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3 hidden">
						<div className="bg-muted/50 rounded-xl">
							<h2 className="p-2 flex items-center gap-2">Distance</h2>
							<ChartContainer config={distanceConfig}>
								<BarChart className=" w-full" data={distanceData}>
									<CartesianGrid vertical={false} />
									<Bar
										isAnimationActive={false}
										dataKey="distance"
										fill="var(--color-distance)"
										radius={4}
									/>

									<ChartTooltip
										content={
											<ChartTooltipContent
												formatter={(value) =>
													`${((value as number) * 0.00062137).toFixed(0)} mi`
												}
											/>
										}
									/>
								</BarChart>
							</ChartContainer>
						</div>
						<div
							className={`${isLoadingAllActivities ? "bg-transparent" : "bg-muted/50"} rounded-xl hidden lg:block`}
						>
							{isLoadingAllActivities ? (
								<ChartLoader />
							) : (
								<>
									<h2 className="p-2 flex items-center gap-2">Heat Map</h2>
									<ActivityHeatmap />
								</>
							)}
						</div>
						<div className="bg-muted/50 rounded-xl">
							<h2 className="p-2 flex items-center gap-2">Heart Rate</h2>
							<ChartContainer config={heartRateConfig}>
								<AreaChart className=" w-full" data={heartRateData}>
									<CartesianGrid vertical={false} />
									<Area
										isAnimationActive={false}
										dataKey="heartRate"
										fill="var(--color-heartRate)"
										stroke="var(--color-heartRate)"
										strokeWidth={2}
									/>
								</AreaChart>
							</ChartContainer>
						</div>
					</div>
				)}

				<div className={"bg-muted/50 flex min-h-0 flex-1 flex-col rounded-xl"}>
					<DataTable
						columns={columns}
						data={tableData}
						onLoadMore={fetchNextPage}
						isLoading={isFetchingNextPage || isFetching}
					/>
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

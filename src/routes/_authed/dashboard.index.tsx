import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
} from "recharts";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPace } from "@/lib/utils";
import { DataTable } from "./-activity-table";
import { PendingComponent } from "./-pending-component";
export const Route = createFileRoute("/_authed/dashboard/")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: async ({ context: { queryClient } }) => {
		await queryClient.prefetchInfiniteQuery(
			fetchAthleteActivitiesQueryOptions(),
		);
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

	const activitesToChart = athleteActivities.pages[0];
	const distanceData = activitesToChart
		.map((activity, index) => ({
			distance: activity.distance || activitesToChart[index - 1]?.distance,
		}))
		.reverse();

	const paceData = activitesToChart
		.map((activity) => ({
			average_speed: formatPace(activity.average_speed),
		}))
		.reverse();

	const heartRateData = activitesToChart
		.map((activity, index) => ({
			heartRate:
				activity.average_heartrate ||
				activitesToChart[index - 1]?.average_heartrate,
		}))
		.reverse();

	const distanceConfig = {
		distance: {
			label: "Distance",
			color: "#2563eb",
		},
	} satisfies ChartConfig;

	const paceConfig = {
		average_speed: {
			label: "Pace (min/mi)",
			color: "var(--primary)",
		},
	} satisfies ChartConfig;
	console.log({ heartRateData, paceData, distanceData });
	const heartRateConfig = {
		heartRate: {
			label: "Heart Rate",
			color: "#FF0800",
		},
	} satisfies ChartConfig;

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
					className: "hidden md:table-cell", // hidden on mobile
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
					className: "hidden md:table-cell", // hidden on mobile
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
				accessorKey: "max_heartrate",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Max Heart Rate
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},
				meta: {
					className: "hidden md:table-cell", // hidden on mobile
				},
				cell: ({ row }) => {
					if (!row.original.max_heartrate) return <div>no data</div>;
					return <div>{row.original.max_heartrate} bpm</div>;
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
					<div className="sm:grid auto-rows-min gap-4 md:grid-cols-3 hidden">
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
						<div className="bg-muted/50 rounded-xl">
							<h2 className="p-2 flex items-center gap-2">Pace</h2>
							<ChartContainer config={paceConfig}>
								<LineChart className=" w-full" data={paceData}>
									<CartesianGrid vertical={false} />
									<Line
										isAnimationActive={false}
										dataKey="average_speed"
										stroke="var(--color-suffer)"
										dot={false}
									/>
								</LineChart>
							</ChartContainer>
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
						data={(athleteActivities.pages.flat() as TActivity[]).filter(
							(activity) => activity.type === "Run",
						)}
						onLoadMore={fetchNextPage}
						isLoading={isFetchingNextPage || isFetching}
					/>
				</div>
			</div>
		</SidebarInset>
	);
}

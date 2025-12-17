import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
} from "recharts";
import {
	fetchAthleteActivitiesQueryOptions,
	fetchAthleteQueryOptions,
	fetchAthleteStatsQueryOptions,
} from "@/api/client";
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
import { DataTable } from "./-activity-table";

export const Route = createFileRoute("/_authed/dashboard/main")({
	component: RouteComponent,

	loader: async ({ context: { queryClient } }) => {
		const athlete = await queryClient.ensureQueryData(
			fetchAthleteQueryOptions(),
		);
		await queryClient.ensureQueryData(
			fetchAthleteStatsQueryOptions({ athleteId: athlete.id }),
		);
		await queryClient.ensureQueryData(fetchAthleteActivitiesQueryOptions());
	},
});

function RouteComponent() {
	const isMobile = useIsMobile();
	const { data: athleteActivities } = useSuspenseQuery(
		fetchAthleteActivitiesQueryOptions(),
	);

	console.log({ athleteActivities });

	const distanceData = athleteActivities
		.map((activity, index) => ({
			distance: activity.distance || athleteActivities[index - 1]?.distance,
		}))
		.reverse();

	const sufferData = athleteActivities
		.map((activity, index) => ({
			suffer:
				activity.suffer_score || athleteActivities[index - 1]?.suffer_score,
		}))
		.reverse();

	const heartRateData = athleteActivities
		.map((activity, index) => ({
			heartRate:
				activity.average_heartrate ||
				athleteActivities[index - 1]?.average_heartrate,
		}))
		.reverse();

	const distanceConfig = {
		distance: {
			label: "Distance",
			color: "#2563eb",
		},
	} satisfies ChartConfig;

	const sufferConfig = {
		suffer: {
			label: "Suffer Score",
			color: "var(--primary)",
		},
	} satisfies ChartConfig;

	const heartRateConfig = {
		heartRate: {
			label: "Heart Rate",
			color: "#FF0800",
		},
	} satisfies ChartConfig;

	const columns: ColumnDef<TActivity>[] = [
		{
			accessorKey: "distance",
			header: "Distance",
			cell: ({ row }) => {
				return (
					<div>
						{((row.original.distance as number) * 0.00062137).toFixed(2)} mi
					</div>
				);
			},
		},
		{
			accessorKey: "moving_time",
			header: "Moving Time",
			cell: ({ row }) => {
				if (!row.original.moving_time) return <div>no data</div>;
				if (row.original.moving_time > 3600) {
					console.log(row.original.moving_time);
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
			header: "Total Elevation Gain",
			cell: ({ row }) => {
				return <div>{row.original.total_elevation_gain.toFixed(0)} ft</div>;
			},
		},
		{
			accessorKey: "average_heartrate",
			header: "Average Heart Rate",
			cell: ({ row }) => {
				if (!row.original.average_heartrate) return <div>no data</div>;
				return <div>{row.original.average_heartrate.toFixed(0)} bpm</div>;
			},
		},
		{
			accessorKey: "max_heartrate",
			header: "Max Heart Rate",
			cell: ({ row }) => {
				if (!row.original.max_heartrate) return <div>no data</div>;
				return <div>{row.original.max_heartrate} bpm</div>;
			},
		},

		{
			accessorKey: "start_date",
			header: "Date",
			cell: ({ row }) => {
				return (
					<div>{new Date(row.original.start_date).toLocaleDateString()}</div>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				// const payment = row.original;

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
							<DropdownMenuItem>View Run</DropdownMenuItem>
							<DropdownMenuSeparator />
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return (
		<SidebarInset
			className={
				isMobile
					? "flex flex-1 flex-col overflow-auto"
					: "flex min-h-0 flex-1 flex-col"
			}
		>
			<div
				className={
					isMobile
						? "flex flex-1 flex-col gap-4 p-4"
						: "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"
				}
			>
				<div className="grid auto-rows-min gap-4 md:grid-cols-3">
					<div className="bg-muted/50 rounded-xl">
						<h2 className="p-2">Distance 🏃‍♂️</h2>
						<ChartContainer config={distanceConfig}>
							<BarChart className=" w-full" data={distanceData}>
								<CartesianGrid vertical={false} />
								<Bar
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
						<h2 className="p-2">Suffer Score 💪</h2>
						<ChartContainer config={sufferConfig}>
							<LineChart className=" w-full" data={sufferData}>
								<CartesianGrid vertical={false} />
								<Line
									dataKey="suffer"
									stroke="var(--color-suffer)"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ChartContainer>
					</div>
					<div className="bg-muted/50 rounded-xl">
						<h2 className="p-2">Heart Rate 💓</h2>
						<ChartContainer config={heartRateConfig}>
							<AreaChart className=" w-full" data={heartRateData}>
								<CartesianGrid vertical={false} />
								<Area
									dataKey="heartRate"
									fill="var(--color-heartRate)"
									stroke="var(--color-heartRate)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ChartContainer>
					</div>
				</div>
				<div
					className={
						isMobile
							? "bg-muted/50 flex flex-col rounded-xl"
							: "bg-muted/50 flex min-h-0 flex-1 flex-col rounded-xl"
					}
				>
					<DataTable columns={columns} data={athleteActivities} />
				</div>
			</div>
		</SidebarInset>
	);
}

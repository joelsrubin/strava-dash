import { useDebouncer } from "@tanstack/react-pacer";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import {
	fetchActivityQueryOptions,
	fetchAthleteActivitiesQueryOptions,
} from "@/api/queries/strava";
import { Button } from "@/components/ui/button";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useUnitOfMeasurement } from "@/lib/user-preferences";
import { cn, formatDistance, formatPace } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export function DataTable() {
	const {
		data: athleteActivities,
		fetchNextPage,
		isFetching,
		isFetchingNextPage,
	} = useSuspenseInfiniteQuery(fetchAthleteActivitiesQueryOptions());
	const [sorting, setSorting] = useState<SortingState>([]);
	const { unitOfMeasurement } = useUnitOfMeasurement();
	const tableData = useMemo(
		() => athleteActivities.pages.flat() as TActivity[],
		[athleteActivities],
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
							{formatDistance(row.original.distance, unitOfMeasurement)}
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
					return (
						<div>
							{formatPace(row.original.average_speed, unitOfMeasurement)}{" "}
							{unitOfMeasurement === "miles" ? "/mi" : "/km"}
						</div>
					);
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
							className="px-0 py-2 rounded-t-md"
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
		],
		[unitOfMeasurement],
	);
	const table = useReactTable({
		data: tableData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),

		state: {
			sorting,
		},
	});

	const navigate = useNavigate({ from: "/dashboard/" });
	const { queryClient } = useRouteContext({
		from: "/_authed/dashboard/_charts",
	});

	const prefetchDebouncer = useDebouncer(
		(runId: number) => {
			queryClient.prefetchQuery(fetchNoteByRunIdQueryOptions({ runId }));
			queryClient.prefetchQuery(fetchActivityQueryOptions(String(runId)));
		},
		{ wait: 1000 },
	);

	const handleMouseEnter = (runId: number) => {
		prefetchDebouncer.maybeExecute(runId);
	};

	const handleMouseLeave = () => {
		prefetchDebouncer.cancel();
	};

	return (
		<div className="relative flex min-h-0 flex-1 flex-col rounded-md border">
			<div className="min-h-0 flex-1 overflow-auto">
				<Table>
					<TableHeader className="rounded-t-md sticky top-0 z-10 bg-background">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className={cn(
												// biome-ignore lint/suspicious/noExplicitAny: False positive due to generic typing
												(header.column.columnDef as any).meta?.className,
												"rounded-t-md",
											)}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									onMouseEnter={() => handleMouseEnter(Number(row.original.id))}
									onMouseLeave={handleMouseLeave}
									onClick={() => {
										// TODO: Navigate to activity detail page
										navigate({
											to: "/dashboard/run/$id",
											params: { id: row.original.id.toString() },
											search: (prev) => ({
												...prev,
												tab: "activity-table",
											}),
										});
									}}
									data-state={row.getIsSelected() && "selected"}
									key={row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												// biome-ignore lint/suspicious/noExplicitAny: False positive due to generic typing
												(cell.column.columnDef as any).meta?.className,
												"py-4",
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									rowSpan={20}
									className="h-24 text-center"
								>
									<EmptyState />
								</TableCell>
							</TableRow>
						)}
						{table.getRowModel().rows?.length >= 30 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="text-center py-4"
								>
									<Button
										disabled={isFetching || isFetchingNextPage}
										onClick={() => fetchNextPage?.()}
										variant="ghost"
										className="w-full"
									>
										{isFetching || isFetchingNextPage
											? "Loading..."
											: "Load More"}
										<ChevronDown />
									</Button>
								</TableCell>
							</TableRow>
						) : null}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

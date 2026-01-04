import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatPace } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export function DataTable() {
	const {
		data: athleteActivities,
		fetchNextPage,
		isFetching,
		isFetchingNextPage,
	} = useSuspenseInfiniteQuery(fetchAthleteActivitiesQueryOptions());
	const [sorting, setSorting] = useState<SortingState>([]);
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

	return (
		<div className="relative flex min-h-0 flex-1 flex-col rounded-md border">
			<div className="p-2 text-sm font-medium">Activities</div>
			<div className="min-h-0 flex-1 overflow-auto">
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-background">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className={
												// biome-ignore lint/suspicious/noExplicitAny: False positive due to generic typing
												(header.column.columnDef as any).meta?.className
											}
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
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={
												// biome-ignore lint/suspicious/noExplicitAny: False positive due to generic typing
												(cell.column.columnDef as any).meta?.className
											}
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
						{table.getRowModel().rows?.length === 30 ? (
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

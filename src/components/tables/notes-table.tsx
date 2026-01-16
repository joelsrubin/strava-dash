import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
	type Column,
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	AlertCircle,
	ArrowUpDown,
	ArrowUpRightIcon,
	FilterIcon,
	FilterXIcon,
	ListFilterIcon,
	Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";
import { Button } from "@/components/ui/button";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ParsedNote } from "@/db";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TableProvider } from "@/lib/notes-table-provider";
import { parseNoteContent } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "../ui/combobox";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "../ui/drawer";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../ui/input-group";
import { BulkToolbar } from "./bulk-toolbar";
import { HashtagList } from "./hashtag-list";

export function NotesTable() {
	const { athlete } = useRouteContext({
		from: "/_authed/dashboard/_charts/",
	});

	const { data: notesData } = useSuspenseQuery(
		fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
	);

	const allHashtags = Array.from(
		new Set(notesData.results.flatMap((note) => note.hashtags)),
	).sort() as string[];

	const tableData = notesData.results;
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "activity_date",
			desc: true, // sort by name in descending order by default
		},
	]);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const columns: ColumnDef<ParsedNote>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						className="mr-2"
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				accessorKey: "activity_date",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Activity Date
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},

				cell: ({ row }) => {
					return (
						<div className="text-right mr-2">
							{new Date(row.original.activity_date).toLocaleDateString()}
						</div>
					);
				},
			},
			{
				accessorKey: "updated_at",
				header: ({ column }) => {
					return (
						<Button
							className="px-0 py-2"
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							Updated
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},
				meta: {
					className: "hidden lg:table-cell", // hidden on mobile
				},
				cell: ({ row }) => {
					return (
						<div className="text-right mr-2">
							{new Date(row.original.updated_at).toLocaleDateString()}
						</div>
					);
				},
			},
			{
				accessorKey: "content",
				header: () => {
					return <div className="px-0 py-2">Content</div>;
				},
				meta: {
					className: "w-full max-w-0",
				},
				cell: ({ row }) => {
					const parsed = parseNoteContent(row.original.content);

					return (
						<Link
							to="/dashboard/run/$id"
							params={{ id: row.original.run_id.toString() }}
							search={(prev) => ({
								tab: prev.tab,
							})}
							preload="intent"
						>
							<div
								className="line-clamp-2 min-h-[33px] wrap-break-word"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: safe html content
								dangerouslySetInnerHTML={{ __html: parsed.text }}
							/>
						</Link>
					);
				},
			},
			{
				accessorKey: "hashtags",
				header: () => {
					return <div>Hashtags</div>;
				},
				meta: {
					className: "hidden sm:table-cell", // hidden on mobile
					filterVariant: "select",
				},
				filterFn: (row, columnId, filterValue: string[] | undefined) => {
					const hashtags = row.getValue(columnId) as string[] | null;
					if (!hashtags || !filterValue || filterValue.length === 0)
						return true;
					// Show row if it has ANY of the selected hashtags
					return filterValue.some((tag) => hashtags.includes(tag));
				},
				cell: ({ row }) => {
					if (!row.original.hashtags) return <div>no data</div>;
					if (row.original.hashtags.length === 0)
						return <div className="text-center"> - </div>;
					return (
						<div className="max-w-xs">
							<HashtagList maxVisible={2} hashtags={row.original.hashtags} />
						</div>
					);
				},
			},
		],
		[],
	);

	const table = useReactTable({
		data: tableData,
		columns,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),

		state: {
			sorting,
			columnFilters,
			columnOrder: [
				"select",
				"content",
				"hashtags",
				"activity_date",
				"updated_at",
			],
		},
	});

	return (
		<div className="relative flex min-h-0 flex-1 flex-col rounded-md border">
			<div className="flex flex-row items-center justify-between p-2 gap-4">
				<div className="flex  gap-y-2 sm:gap-y-0 flex-row gap-x-2 flex-1 min-w-0 items-center">
					<div className="min-w-0 shrink-0">
						<InputGroup className="rounded-md bg-background">
							<InputGroupInput
								type="search"
								value={
									(table.getColumn("content")?.getFilterValue() as string) ?? ""
								}
								onChange={(event) =>
									table.getColumn("content")?.setFilterValue(event.target.value)
								}
								placeholder="Search notes..."
								className="rounded-2xl"
							/>
							<InputGroupAddon>
								<Search />
							</InputGroupAddon>
						</InputGroup>
					</div>
					{/* <FilterDrawer>
						<Button
							className="inline-flex items-center justify-center sm:hidden"
							size="icon-sm"
						>
							<FilterIcon />
						</Button>
					</FilterDrawer> */}
					<Filter column={table.getColumn("hashtags")} hashtags={allHashtags} />
				</div>
			</div>

			<div className="min-h-0 flex-1 overflow-auto">
				<Table className="">
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
									<Empty>
										<EmptyHeader>
											<EmptyMedia variant="icon">
												<AlertCircle />
											</EmptyMedia>
											<EmptyTitle>No Notes Found</EmptyTitle>
											<EmptyDescription>
												If you haven't added any notes, add one to an activity
											</EmptyDescription>
										</EmptyHeader>
										<EmptyContent>
											<Button
												variant="link"
												asChild
												className="text-muted-foreground"
												size="sm"
											>
												<Link to={"/dashboard"}>
													View Activities <ArrowUpRightIcon />
												</Link>
											</Button>
										</EmptyContent>
									</Empty>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<TableProvider table={table}>
				<BulkToolbar />
			</TableProvider>
		</div>
	);
}

function Filter<T extends { hashtags?: string[] }>({
	column,
	hashtags,
}: {
	column?: Column<T, unknown>;
	hashtags: string[];
}) {
	const columnFilterValue = column
		? ((column.getFilterValue() as string[]) ?? [])
		: [];
	const anchor = useComboboxAnchor();

	return (
		<Combobox
			multiple
			value={columnFilterValue}
			onValueChange={(value) => {
				column?.setFilterValue(value.length > 0 ? value : undefined);
			}}
			autoHighlight
			items={hashtags}
		>
			<ComboboxChips
				ref={anchor}
				className="hidden sm:inline-flex rounded-md bg-background min-w-0"
			>
				{columnFilterValue.map((tag) => (
					<ComboboxChip key={tag}>{`#${tag}`}</ComboboxChip>
				))}
				<ComboboxChipsInput
					className="text-[16px] text-foreground"
					placeholder={columnFilterValue.length ? "" : "Filter by hashtag"}
				/>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>No tags found</ComboboxEmpty>
				<ComboboxList>
					{(item: string) => (
						<ComboboxItem key={item} value={item}>
							{`#${item}`}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}

function FilterDrawer({ children }: { children: React.ReactNode }) {
	return (
		<Drawer>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>Edit profile</DrawerTitle>
					<DrawerDescription>
						Make changes to your profile here. Click save when you&apos;re done.
					</DrawerDescription>
				</DrawerHeader>

				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

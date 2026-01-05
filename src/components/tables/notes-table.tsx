import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
	Column,
	type ColumnDef,
	ColumnFiltersState,
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
	MoreHorizontal,
	Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeleteNoteMutation } from "@/api/mutations/notes";
import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";
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
import type { ParsedNote } from "@/db";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseNoteContent } from "@/lib/utils";
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
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import { Input } from "../ui/input";
import { HashtagList } from "./hashtag-list";

export function NotesTable({ stravaId }: { stravaId: number }) {
	const { queryClient } = useRouteContext({
		from: "/_authed/dashboard/_charts/notes",
	});
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
	const { data: notesData } = useSuspenseQuery(
		fetchNotesByStravaIdQueryOptions({ stravaId }),
	);
	const { isMobile } = useIsMobile();
	const allHashtags = Array.from(
		new Set(notesData.results.flatMap((note) => note.hashtags)),
	).sort() as string[];

	const { mutate: deleteNote, isPending: isDeleting } = useDeleteNoteMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notes"] });
			toast.success("Note deleted successfully");
		},
		onError: (error) => {
			console.error("Failed to delete note:", error);
			toast.error("Failed to delete note");
		},
	});

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
							Date
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					);
				},

				cell: ({ row }) => {
					return (
						<div>
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
						<div>{new Date(row.original.updated_at).toLocaleDateString()}</div>
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
						<div
							className="truncate line-clamp-1"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: safe html content
							dangerouslySetInnerHTML={{ __html: parsed.text }}
						/>
					);
				},
			},
			{
				accessorKey: "hashtags",
				header: () => {
					return <div>Hashtags</div>;
				},
				meta: {
					className: "hidden lg:table-cell", // hidden on mobile
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
					if (row.original.hashtags.length === 0) return <div> - </div>;
					return (
						<div className="max-w-xs">
							<HashtagList maxVisible={2} hashtags={row.original.hashtags} />
						</div>
					);
				},
			},

			{
				id: "actions",
				cell: ({ row }) => {
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="flex h-4 w-4 p-0 ml-auto">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>

								<DropdownMenuItem asChild>
									<Link
										to="/dashboard/run/$id"
										params={{ id: row.original.run_id.toString() }}
										preload="render"
									>
										View Run
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setNoteToDelete(row.original.id);
										setDeleteDialogOpen(true);
									}}
								>
									Delete Note
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
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),

		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<>
			<div className="relative flex min-h-0 flex-1 flex-col rounded-md border">
				<div className="flex flex-row items-center justify-between mb-2 p-2 gap-4">
					<div className="text-sm font-medium">Notes</div>
					<div className="flex flex-col gap-y-2 sm:gap-y-0 sm:flex-row gap-x-2">
						<div className="w-full max-w-md relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								value={
									(table.getColumn("content")?.getFilterValue() as string) ?? ""
								}
								onChange={(event) =>
									table.getColumn("content")?.setFilterValue(event.target.value)
								}
								placeholder="Search notes..."
								className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
							/>
						</div>
						{!isMobile ? (
							<Filter
								column={table.getColumn("hashtags")!}
								hashtags={allHashtags}
							/>
						) : null}
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
			</div>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
								<AlertCircle className="size-5 text-destructive" />
							</div>
							<DialogTitle className="text-balance">Are you sure?</DialogTitle>
						</div>
						<DialogDescription className="pt-2">
							This action cannot be undone. This will permanently delete the
							note.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2">
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isDeleting}>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								if (noteToDelete) {
									deleteNote(
										{ id: noteToDelete },
										{
											onSuccess: () => {
												setDeleteDialogOpen(false);
												setNoteToDelete(null);
											},
										},
									);
								}
							}}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function Filter({
	column,
	hashtags,
}: {
	column: Column<any, unknown>;
	hashtags: string[];
}) {
	const columnFilterValue = (column.getFilterValue() as string[]) ?? [];
	const anchor = useComboboxAnchor();

	return (
		<Combobox
			multiple
			value={columnFilterValue}
			onValueChange={(value) => {
				column.setFilterValue(value.length > 0 ? value : undefined);
			}}
			autoHighlight
			items={hashtags}
		>
			<ComboboxChips ref={anchor} className="rounded-md bg-background w-full">
				{columnFilterValue.map((tag) => (
					<ComboboxChip key={tag}>{tag}</ComboboxChip>
				))}
				<ComboboxChipsInput
					className="text-xs"
					placeholder="Filter by hashtag"
				/>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>No tags found</ComboboxEmpty>
				<ComboboxList>
					{(item: string) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}

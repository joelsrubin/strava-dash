import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Hash, Search } from "lucide-react";
import { useState } from "react";
import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";

import { HashtagsCard } from "@/components/notes/hashtags-card";
import { NoteCard } from "@/components/notes/note-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getActivityMonth, getActivityYear } from "@/lib/utils";
import { PendingComponent } from "./-pending-component";

export const Route = createFileRoute("/_authed/dashboard/notes")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,

	loader: async ({ context: { queryClient, athlete } }) => {
		// Fire-and-forget prefetch - don't block navigation
		await queryClient.ensureQueryData(
			fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
		);
	},
	validateSearch: (search: Record<string, unknown>) => {
		// validate and parse the search params into a typed state
		return {
			year: search?.year ? Number(search.year) : undefined,
			month: search?.month ? String(search.month) : undefined,
		};
	},
});

function RouteComponent() {
	const { athlete, queryClient } = Route.useRouteContext();
	const { data: notesData } = useSuspenseQuery(
		fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
	);
	const { year, month } = Route.useSearch();

	const notes = notesData.results.filter((note) => {
		if (!year) return true;

		if (year) {
			if (month) {
				return (
					getActivityMonth(note.activity_date) === month &&
					getActivityYear(note.activity_date) === year
				);
			}
			return getActivityYear(note.activity_date) === year;
		}

		return false;
	});

	const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	// Extract all unique hashtags from all notes
	const allHashtags = Array.from(
		new Set(notes.flatMap((note) => note.hashtags)),
	).sort() as string[];

	// Filter and sort notes based on selected hashtags and search query (newest first)
	const filteredNotes = notes
		.filter((note) => {
			const matchesHashtags =
				selectedHashtags.length === 0 ||
				selectedHashtags.some((tag) => note.hashtags.includes(tag));
			const matchesSearch =
				searchQuery === "" ||
				note.content.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesHashtags && matchesSearch;
		})
		.sort(
			(a, b) =>
				new Date(b.activity_date).getTime() -
				new Date(a.activity_date).getTime(),
		);

	const toggleHashtag = (hashtag: string) => {
		setSelectedHashtags((prev) =>
			prev.includes(hashtag)
				? prev.filter((t) => t !== hashtag)
				: [...prev, hashtag],
		);
	};

	return (
		<div className="h-full flex flex-col bg-background p-6 w-full overflow-hidden">
			<div className="max-w-7xl space-y-6 w-full flex flex-col min-h-0 flex-1">
				{/* Header */}
				<div className="flex items-center justify-between shrink-0">
					<div>
						<h1 className="text-4xl font-bold text-foreground">Notes</h1>
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative shrink-0">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search notes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 text-[16px]"
					/>
				</div>

				{/* Hashtag Filter Pills */}
				<div className="shrink-0">
					<HashtagsCard
						allHashtags={allHashtags}
						selectedHashtags={selectedHashtags}
						toggleHashtag={toggleHashtag}
						setSelectedHashtags={setSelectedHashtags}
					/>
				</div>

				{/* Notes Grid - Scrollable */}
				<div className="flex-1 overflow-auto min-h-0 -mx-1 px-1">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-6 pt-1">
						{filteredNotes.map((note) => (
							<NoteCard
								queryClient={queryClient}
								key={note.id}
								note={note}
								toggleHashtag={toggleHashtag}
							/>
						))}
					</div>

					{/* Empty State */}
					{filteredNotes.length === 0 && (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<Hash className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold text-foreground mb-2">
									No notes found
								</h3>
								<p className="text-muted-foreground max-w-md">
									{selectedHashtags.length > 0 || searchQuery
										? "Try adjusting your filters or search query"
										: "Start tracking your training journey by adding your first note"}
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}

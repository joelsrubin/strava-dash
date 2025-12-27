import type { QueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Hash, Search } from "lucide-react";
import { useState } from "react";
import { fetchNotesByUserIdOptions } from "@/api/queries/notes";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { User } from "@/db";
import { HashtagsCard } from "./hashtags-card";
import { NoteCard } from "./note-card";

export default function NotesPage({
	user,
	queryClient,
}: {
	user: User;
	queryClient: QueryClient;
}) {
	const { data: notesData } = useSuspenseQuery(
		fetchNotesByUserIdOptions({ userId: user.id }),
	);

	const notes = notesData.results;

	const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	// Extract all unique hashtags from all notes
	const allHashtags = Array.from(
		new Set(notes.flatMap((note) => note.hashtags)),
	).sort() as string[];

	// Filter notes based on selected hashtags and search query
	const filteredNotes = notes.filter((note) => {
		const matchesHashtags =
			selectedHashtags.length === 0 ||
			selectedHashtags.some((tag) => note.hashtags.includes(tag));
		const matchesSearch =
			searchQuery === "" ||
			note.content.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesHashtags && matchesSearch;
	});

	const toggleHashtag = (hashtag: string) => {
		setSelectedHashtags((prev) =>
			prev.includes(hashtag)
				? prev.filter((t) => t !== hashtag)
				: [...prev, hashtag],
		);
	};

	return (
		<div className="min-h-screen bg-background p-6 flex mx-auto">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-4xl font-bold text-foreground">
							Training Notes
						</h1>
						<p className="text-muted-foreground mt-1">
							Track your thoughts, insights, and progress
						</p>
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search notes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Hashtag Filter Pills */}
				<HashtagsCard
					allHashtags={allHashtags}
					selectedHashtags={selectedHashtags}
					toggleHashtag={toggleHashtag}
					setSelectedHashtags={setSelectedHashtags}
				/>

				{/* Notes Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
	);
}

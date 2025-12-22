import { Link } from "@tanstack/react-router";
import { Calendar, Hash, Link2, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Note } from "@/db";
import { parseNoteContent } from "@/lib/utils";

export default function NotesPage({ notes }: { notes: Note[] }) {
	const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	// Extract all unique hashtags from all notes
	const allHashtags = Array.from(
		new Set(notes.flatMap((note) => JSON.parse(note.hashtags))),
	).sort() as string[];

	// Filter notes based on selected hashtags and search query
	const filteredNotes = notes.filter((note) => {
		const matchesHashtags =
			selectedHashtags.length === 0 ||
			selectedHashtags.some((tag) => JSON.parse(note.hashtags).includes(tag));
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
		<div className="min-h-screen bg-background p-6">
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
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Hash className="h-5 w-5 text-muted-foreground" />
							<CardTitle className="text-lg">Filter by Tags</CardTitle>
							{selectedHashtags.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setSelectedHashtags([])}
									className="ml-auto text-xs"
								>
									Clear all
								</Button>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{allHashtags.map((hashtag) => (
								<Badge
									key={hashtag}
									variant={
										selectedHashtags.includes(hashtag) ? "default" : "outline"
									}
									className="cursor-pointer hover:bg-primary/90 transition-colors px-3 py-1.5 text-sm"
									onClick={() => toggleHashtag(hashtag)}
								>
									{`#${hashtag}`}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Notes Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredNotes.map((note) => (
						<Card
							key={note.id}
							className="hover:border-primary/90 transition-colors"
						>
							<Link
								to={`/dashboard/run/$id`}
								params={{ id: note.run_id.toString() }}
							>
								<CardContent className="pt-6">
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Calendar className="h-3 w-3" />
												{new Date(note.created_at).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</div>
										</div>
										<p className="text-sm leading-relaxed text-foreground">
											{parseNoteContent(note.content).text}
										</p>
										<div className="flex flex-wrap gap-1.5 pt-2">
											{JSON.parse(note.hashtags).map((hashtag: string) => (
												<Badge
													key={hashtag}
													variant="secondary"
													className="text-xs cursor-pointer hover:bg-secondary/80"
													onClick={() => toggleHashtag(hashtag)}
												>
													{`#${hashtag}`}
												</Badge>
											))}
										</div>
										<div>
											{parseNoteContent(note.content).links.map((link) => (
												<a
													key={link.url}
													href={link.url}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Badge
														variant="secondary"
														className="text-xs cursor-pointer hover:bg-secondary/80"
													>
														<Link2 />
														{link.text}
													</Badge>
												</a>
											))}
										</div>
									</div>
								</CardContent>
							</Link>
						</Card>
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

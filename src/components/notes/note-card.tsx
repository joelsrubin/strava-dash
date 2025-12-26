import type { QueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Footprints, Link2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteNoteMutation } from "@/api/mutations/notes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ParsedNote } from "@/db";
import { parseNoteContent } from "@/lib/utils";
import { DeleteConfirmationModal } from "./delete-modal";

export function NoteCard({
	note,
	queryClient,
	toggleHashtag,
}: {
	note: ParsedNote;
	queryClient: QueryClient;
	toggleHashtag: (hashtag: string) => void;
}) {
	console.log({ note });
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
	return (
		<Card
			key={note.id}
			className="hover:border-primary/90 transition-colors max-h-[200px] overflow-hidden"
		>
			<CardContent className="pt-6">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Footprints className="h-3 w-3" />
							{note?.activity_date
								? new Date(note.activity_date).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})
								: "No date"}
						</div>
						<DeleteConfirmationModal
							onConfirm={() => deleteNote({ id: note.id })}
							isLoading={isDeleting}
						/>
					</div>
					<Link
						to={`/dashboard/run/$id`}
						params={{ id: note.run_id.toString() }}
					>
						<p className="text-sm leading-relaxed text-foreground line-clamp-3">
							{parseNoteContent(note.content).text}
						</p>
					</Link>
					<div className="flex flex-wrap gap-1.5 pt-2">
						{note.hashtags.map((hashtag: string) => (
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
		</Card>
	);
}

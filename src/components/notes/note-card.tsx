import { Link } from "@tanstack/react-router";
import { Calendar, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ParsedNote } from "@/db";
import { parseNoteContent } from "@/lib/utils";

export function NoteCard({
	note,
	toggleHashtag,
}: {
	note: ParsedNote;
	toggleHashtag: (hashtag: string) => void;
}) {
	return (
		<Card
			key={note.id}
			className="hover:border-primary/90 transition-colors max-h-[200px] overflow-hidden"
		>
			<Link to={`/dashboard/run/$id`} params={{ id: note.run_id.toString() }}>
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
						<p className="text-sm leading-relaxed text-foreground line-clamp-3">
							{parseNoteContent(note.content).text}
						</p>
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
			</Link>
		</Card>
	);
}

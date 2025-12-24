import { Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HashtagsCard({
	allHashtags,
	selectedHashtags,
	toggleHashtag,
	setSelectedHashtags,
}: {
	allHashtags: string[];
	selectedHashtags: string[];
	toggleHashtag: (hashtag: string) => void;
	setSelectedHashtags: (hashtags: string[]) => void;
}) {
	return (
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
	);
}

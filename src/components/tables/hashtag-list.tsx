import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface HashtagListProps {
	hashtags: string[];
	maxVisible?: number;
}

export function HashtagList({ hashtags, maxVisible = 4 }: HashtagListProps) {
	const visibleHashtags = hashtags.slice(0, maxVisible);
	const remainingHashtags = hashtags.slice(maxVisible);
	const remainingCount = remainingHashtags.length;

	return (
		<div className="flex flex-nowrap gap-1.5 items-center">
			{visibleHashtags.map((tag) => (
				<Badge
					key={tag}
					variant="secondary"
					className="text-xs font-normal px-2 py-0.5"
				>
					#{tag}
				</Badge>
			))}

			{remainingCount > 0 && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
						>
							+{remainingCount} more
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto max-w-sm p-3" align="start">
						<div className="flex flex-col gap-1.5">
							{remainingHashtags.map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
									className="text-xs font-normal px-2 py-0.5"
								>
									#{tag}
								</Badge>
							))}
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}

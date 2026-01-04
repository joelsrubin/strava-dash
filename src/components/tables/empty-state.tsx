import { Activity } from "lucide-react";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

export function EmptyState() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Activity />
				</EmptyMedia>
				<EmptyTitle>No Runs Recorded</EmptyTitle>
				<EmptyDescription>
					You haven&apos;t recorded any runs yet. Get started by logging your
					first run to begin tracking your progress.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

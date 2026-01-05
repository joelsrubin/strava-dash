import { Skeleton } from "../skeleton";

export function ChartLoader() {
	return (
		<div className="flex flex-col gap-2 h-full">
			<Skeleton className="h-6 w-48 rounded-xl" />
			<div className="space-y-2 flex-1 flex flex-col">
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="h-4 w-full rounded-xl" />
				<Skeleton className="flex-1 w-full rounded-xl" />
			</div>
		</div>
	);
}

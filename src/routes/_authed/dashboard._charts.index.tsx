import { createFileRoute } from "@tanstack/react-router";

import { NotesTable } from "@/components/tables/notes-table";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { DataTable } from "../../components/tables/activity-table";
import { PendingComponent } from "./-pending-component";
export const Route = createFileRoute("/_authed/dashboard/_charts/")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	pendingMs: 0,
});

function RouteComponent() {
	return (
		<>
			<TabsContent
				value="activity-table"
				className="bg-muted/50 rounded-xl min-h-0 flex flex-col"
			>
				<DataTable />
			</TabsContent>
			<TabsContent
				value="notes-table"
				className="bg-muted/50 rounded-xl min-h-0 flex flex-col"
			>
				<NotesTable />
			</TabsContent>
		</>
	);
}

export function TableLoader() {
	return (
		<div className="flex flex-col gap-2 h-full p-4">
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

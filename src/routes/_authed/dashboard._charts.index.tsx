import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
import { EditorComponent } from "@/components/editor/editor-component";
import { NotesTable } from "@/components/tables/notes-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { DataTable } from "../../components/tables/activity-table";
import { PendingComponent } from "./-pending-component";
export const Route = createFileRoute("/_authed/dashboard/_charts/")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	pendingMs: 0,
});

function RouteComponent() {
	const { queryClient, athlete } = Route.useRouteContext();
	const { data: activities } = useSuspenseInfiniteQuery(
		fetchAthleteActivitiesQueryOptions(),
	);
	const latest = activities.pages[0][0];
	const stringifiedId = String(latest.id);
	return (
		<>
			<TabsContent
				value="recent-run"
				className="rounded-xl min-h-0 flex flex-col"
			>
				<div className="flex justify-between items-start sm:items-center px-2 pb-2 ">
					<div className="flex flex-col sm:flex-row gap-2">
						<h2 className="italic">{formatDate(latest.start_date)} </h2>{" "}
						<h2 className="text-balance">Write about your latest run!</h2>
					</div>
					<Link
						preload="render"
						to={"/dashboard/run/$id"}
						params={{ id: stringifiedId }}
					>
						<Button
							size="lg"
							variant="link"
							className="items-start sm:items-center text-foreground"
						>
							<span className="text-xs font-normal">View Activity</span>
							<ChevronRight />
						</Button>
					</Link>
				</div>

				<EditorComponent
					queryClient={queryClient}
					athlete={athlete}
					id={stringifiedId}
				/>
			</TabsContent>
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

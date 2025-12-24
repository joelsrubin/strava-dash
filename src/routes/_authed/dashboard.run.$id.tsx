import { createFileRoute } from "@tanstack/react-router";

import { Suspense } from "react";

import { fetchAthleteByUserQueryOptions } from "@/api/queries/athlete";
import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import { fetchActivityQueryOptions } from "@/api/queries/strava";

import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { RunDetailsPage } from "./-run-details-page";

export const Route = createFileRoute("/_authed/dashboard/run/$id")({
	component: RouteComponent,

	loader: async ({ context: { queryClient, user }, params: { id } }) => {
		queryClient.prefetchQuery(fetchActivityQueryOptions(id));
		queryClient.prefetchQuery(
			fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
		);
		queryClient.prefetchQuery(
			fetchAthleteByUserQueryOptions({ userId: Number(user.id) }),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { user, queryClient } = Route.useRouteContext();

	return (
		<Suspense fallback={<LoadingRunPage />}>
			<RunDetailsPage id={id} user={user} queryClient={queryClient} />
		</Suspense>
	);
}

export function LoadingRunPage() {
	return (
		<SidebarInset className="flex min-h-0 flex-1 flex-col">
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
				<div className="grid auto-rows-min gap-4 grid-cols-1 lg:grid-cols-3 order-2 lg:order-1">
					{/* Run Details Skeleton */}
					<div className="bg-muted/50 rounded-xl p-2 hidden flex-col gap-2 lg:flex">
						<h2>Run Details</h2>
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-1/3" />
					</div>

					{/* Splits Chart Skeleton */}
					<div className="bg-muted/50 rounded-xl md:col-span-1 order-3 lg:order-2">
						<h2 className="p-2">Splits Performance</h2>
						<div className="p-4">
							<Skeleton className="h-[200px] w-full rounded-lg" />
						</div>
					</div>

					{/* Route Preview Skeleton */}
					<div className="bg-muted/50 rounded-xl order-4 lg:order-3 hidden lg:block">
						<h2 className="p-2">Route Preview</h2>
						<Skeleton className="h-[200px] w-full" />
					</div>
				</div>

				{/* Editor Skeleton */}
				<div className="flex flex-1 flex-col bg-muted/50 rounded-xl order-1 lg:order-4 p-4">
					<div className="flex gap-2 mb-4">
						<Skeleton className="h-8 w-8 rounded" />
						<Skeleton className="h-8 w-8 rounded" />
						<Skeleton className="h-8 w-8 rounded" />
						<Skeleton className="h-8 w-8 rounded" />
					</div>
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-4/5" />
					</div>
				</div>
			</div>
		</SidebarInset>
	);
}

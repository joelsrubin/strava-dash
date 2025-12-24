import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";

import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActivitiesPage } from "./-activities-page";

export const Route = createFileRoute("/_authed/dashboard/")({
	component: RouteComponent,

	loader: async ({ context: { queryClient } }) => {
		queryClient.prefetchQuery(fetchAthleteActivitiesQueryOptions());
	},
});

function RouteComponent() {
	return (
		<Suspense fallback={<LoadingPage />}>
			<ActivitiesPage />
		</Suspense>
	);
}

function LoadingPage() {
	const { isMobile } = useIsMobile();
	return (
		<SidebarInset
			className={
				isMobile
					? "flex flex-1 flex-col overflow-auto"
					: "flex min-h-0 flex-1 flex-col"
			}
		>
			<div
				className={
					isMobile
						? "flex flex-1 flex-col gap-4 p-4"
						: "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"
				}
			>
				<div className="grid auto-rows-min gap-4 md:grid-cols-3">
					<div className="bg-muted/50 rounded-xl">
						<Skeleton className="h-32" />
					</div>
					<div className="bg-muted/50 rounded-xl">
						<Skeleton className="h-32" />
					</div>
					<div className="bg-muted/50 rounded-xl">
						<Skeleton className="h-32" />
					</div>
				</div>
				<div
					className={
						isMobile
							? "bg-muted/50 flex flex-col rounded-xl"
							: "bg-muted/50 flex min-h-0 flex-1 flex-col rounded-xl"
					}
				>
					<Skeleton className="flex-1" />
				</div>
			</div>
		</SidebarInset>
	);
}

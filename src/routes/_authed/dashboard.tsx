import {
	createFileRoute,
	notFound,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { Suspense } from "react";
import { getAthlete, getStravaAccessToken } from "@/api/auth.server";
import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";

import { SidebarMenuSkeleton, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authed/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const token = await getStravaAccessToken();
		if (!token) {
			throw redirect({ to: "/" });
		}
		const athlete = await getAthlete();

		if (!athlete) {
			throw notFound();
		}

		return { athlete };
	},
	loader: ({ context: { queryClient, athlete } }) => {
		queryClient.prefetchInfiniteQuery(fetchAthleteActivitiesQueryOptions());
		queryClient.prefetchQuery(
			fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
		);
	},
});

function RouteComponent() {
	const { athlete } = Route.useRouteContext();

	return (
		<div className="h-dvh overflow-hidden [--header-height:calc(--spacing(14))]">
			<SidebarProvider className="flex h-full flex-col">
				<SiteHeader user={athlete} />
				<div className="flex min-h-0 flex-1">
					<Suspense fallback={<SidebarMenuSkeleton />}>
						<AppSidebar user={athlete} />
					</Suspense>
					<Outlet />
				</div>
			</SidebarProvider>
		</div>
	);
}

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

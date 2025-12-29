import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAthlete, getStravaAccessToken } from "@/api/auth.server";
import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authed/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const token = await getStravaAccessToken();
		if (!token) {
			throw redirect({ to: "/" });
		}
		const athlete = await getAthlete();

		if (!athlete) {
			throw redirect({ to: "/" });
		}

		// Fire-and-forget prefetch - don't block navigation

		return { athlete };
	},
	loader: ({ context: { queryClient, athlete } }) => {
		// Fire-and-forget prefetch - don't block navigation
		queryClient.prefetchInfiniteQuery(fetchAthleteActivitiesQueryOptions());
		queryClient.ensureQueryData(
			fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
		);
	},
});

function RouteComponent() {
	const { athlete } = Route.useRouteContext();

	const { data: notes } = useSuspenseQuery(
		fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
	);
	return (
		<div className="h-dvh overflow-hidden [--header-height:calc(--spacing(14))]">
			<SidebarProvider className="flex h-full flex-col">
				<SiteHeader user={athlete} />
				<div className="flex min-h-0 flex-1">
					<AppSidebar user={athlete} notes={notes.results} />
					<Outlet />
				</div>
			</SidebarProvider>
		</div>
	);
}

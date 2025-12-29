import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStravaAccessToken } from "@/api/auth.server";
import { fetchNotesByUserIdOptions } from "@/api/queries/notes";
import {
	fetchAthleteActivitiesQueryOptions,
	fetchAthleteQueryOptions,
} from "@/api/queries/strava";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createUserIfNotExists } from "@/db";

export const Route = createFileRoute("/_authed/dashboard")({
	component: RouteComponent,
	beforeLoad: async ({ context: { queryClient } }) => {
		const token = await getStravaAccessToken();
		if (!token) {
			throw redirect({ to: "/" });
		}
		const [athlete] = await Promise.all([
			queryClient.ensureQueryData(fetchAthleteQueryOptions()),
			queryClient.prefetchInfiniteQuery(fetchAthleteActivitiesQueryOptions()),
		]);

		const { user } = await createUserIfNotExists({
			data: {
				name: `${athlete.firstname} ${athlete.lastname}`,
				strava_id: athlete.id,
			},
		});
		return { user };
	},
	loader: async ({ context: { queryClient, user } }) => {
		await queryClient.ensureQueryData(
			fetchNotesByUserIdOptions({ userId: user.id }),
		);
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { data: athlete } = useSuspenseQuery(fetchAthleteQueryOptions());
	const { data: notes } = useSuspenseQuery(
		fetchNotesByUserIdOptions({ userId: user.id }),
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

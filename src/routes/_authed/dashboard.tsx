import {
	createFileRoute,
	notFound,
	Outlet,
	redirect,
} from "@tanstack/react-router";

import { getAthlete, getStravaAccessToken } from "@/api/auth.server";

import { SiteHeader } from "@/components/dashboard/site-header";

import { getUserPreferences } from "@/db";
import { UserPreferencesProvider } from "@/lib/user-preferences";

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
		const userPreferences = await getUserPreferences({
			data: { strava_id: athlete.id },
		});

		return { athlete, userPreferences };
	},
});

function RouteComponent() {
	const { athlete, userPreferences } = Route.useRouteContext();

	return (
		<UserPreferencesProvider
			stravaId={athlete.id}
			defaultPreferences={userPreferences.preferences}
		>
			<div className="h-dvh overflow-hidden flex flex-col [--header-height:calc(--spacing(14))]">
				<SiteHeader user={athlete} />
				<div className="flex min-h-0 flex-1 flex-col">
					<Outlet />
				</div>
			</div>
		</UserPreferencesProvider>
	);
}

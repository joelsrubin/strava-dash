import {
	createFileRoute,
	notFound,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { Suspense } from "react";
import { getAthlete, getStravaAccessToken } from "@/api/auth.server";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";

import { SidebarMenuSkeleton, SidebarProvider } from "@/components/ui/sidebar";
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
		console.log({ userPreferences });
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
		</UserPreferencesProvider>
	);
}

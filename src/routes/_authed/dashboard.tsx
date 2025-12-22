import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStravaAccessToken } from "@/api/auth.server";
import {
	fetchAthleteActivitiesQueryOptions,
	fetchAthleteQueryOptions,
} from "@/api/queries/strava";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createUserIfNotExists } from "@/db";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_authed/dashboard")({
	component: RouteComponent,
	beforeLoad: async ({ context: { queryClient } }) => {
		const token = await getStravaAccessToken();
		if (!token) {
			throw redirect({ to: "/" });
		}
		const [athlete] = await Promise.all([
			queryClient.ensureQueryData(fetchAthleteQueryOptions()),
			queryClient.ensureQueryData(fetchAthleteActivitiesQueryOptions()),
		]);

		const { user } = await createUserIfNotExists({
			data: {
				name: `${athlete.firstname} ${athlete.lastname}`,
				strava_id: athlete.id,
			},
		});
		return { user };
	},
});

function RouteComponent() {
	const { isMobile } = useIsMobile();
	const { data: athlete } = useSuspenseQuery(fetchAthleteQueryOptions());

	return (
		<div
			className={
				isMobile
					? "min-h-screen [--header-height:calc(--spacing(14))]"
					: "h-screen overflow-hidden [--header-height:calc(--spacing(14))]"
			}
		>
			<SidebarProvider className="flex h-full flex-col">
				<SiteHeader user={athlete} />
				<div className={isMobile ? "flex flex-1" : "flex min-h-0 flex-1"}>
					<AppSidebar user={athlete} />
					<Outlet />
				</div>
			</SidebarProvider>
		</div>
	);
}

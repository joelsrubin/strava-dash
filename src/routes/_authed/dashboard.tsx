import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStravaAccessToken } from "@/api/auth";
import { fetchAthelete } from "@/api/client";
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
		const athlete = await fetchAthelete({ token });

		return { token, athlete };
	},
});

function RouteComponent() {
	const { athlete } = Route.useRouteContext();

	return (
		<div className="[--header-height:calc(--spacing(14))]">
			<SidebarProvider className="flex flex-col">
				<SiteHeader />
				<div className="flex flex-1">
					<AppSidebar user={athlete} />
					<Outlet />
				</div>
			</SidebarProvider>
		</div>
	);
}

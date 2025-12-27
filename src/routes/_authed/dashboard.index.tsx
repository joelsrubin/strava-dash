import { createFileRoute } from "@tanstack/react-router";

import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";

import { ActivitiesPage } from "./-activities-page";
import { PendingComponent } from "./-pending-component";

export const Route = createFileRoute("/_authed/dashboard/")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(fetchAthleteActivitiesQueryOptions());
	},
});

function RouteComponent() {
	return <ActivitiesPage />;
}

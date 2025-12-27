import { createFileRoute } from "@tanstack/react-router";

import { fetchAthleteByUserQueryOptions } from "@/api/queries/athlete";
import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import { fetchActivityQueryOptions } from "@/api/queries/strava";
import { PendingComponent } from "./-pending-component";
import { RunDetailsPage } from "./-run-details-page";

export const Route = createFileRoute("/_authed/dashboard/run/$id")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: async ({ context: { queryClient, user }, params: { id } }) => {
		await queryClient.ensureQueryData(fetchActivityQueryOptions(id));
		await queryClient.ensureQueryData(
			fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
		);
		await queryClient.ensureQueryData(
			fetchAthleteByUserQueryOptions({ userId: Number(user.id) }),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { user, queryClient } = Route.useRouteContext();

	return <RunDetailsPage id={id} user={user} queryClient={queryClient} />;
}

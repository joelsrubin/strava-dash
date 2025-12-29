import { createFileRoute } from "@tanstack/react-router";

import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import { fetchActivityQueryOptions } from "@/api/queries/strava";
import { PendingComponent } from "./-pending-component";
import { RunDetailsPage } from "./-run-details-page";

export const Route = createFileRoute("/_authed/dashboard/run/$id")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: async ({ context: { queryClient }, params: { id } }) => {
		await queryClient.ensureQueryData(fetchActivityQueryOptions(id));
		await queryClient.ensureQueryData(
			fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { queryClient } = Route.useRouteContext();

	return <RunDetailsPage id={id} queryClient={queryClient} />;
}

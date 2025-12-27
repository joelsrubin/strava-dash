import { createFileRoute } from "@tanstack/react-router";

import { fetchNotesByUserIdOptions } from "@/api/queries/notes";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
import NotesPage from "@/components/notes/notes-page";
import { PendingComponent } from "./-pending-component";

export const Route = createFileRoute("/_authed/dashboard/notes")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: async ({ context: { queryClient, user } }) => {
		await queryClient.ensureQueryData(
			fetchNotesByUserIdOptions({ userId: user.id }),
		);
		await queryClient.ensureQueryData(fetchAthleteActivitiesQueryOptions());
	},
});

function RouteComponent() {
	const { user, queryClient } = Route.useRouteContext();
	return <NotesPage user={user} queryClient={queryClient} />;
}

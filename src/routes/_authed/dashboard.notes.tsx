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
	validateSearch: (search: Record<string, unknown>) => {
		// validate and parse the search params into a typed state
		return {
			year: search?.year,
			month: search?.month,
		};
	},
});

function RouteComponent() {
	return <NotesPage />;
}

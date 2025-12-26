import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { fetchNotesByUserIdOptions } from "@/api/queries/notes";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
import NotesPage, { LoadingNotesPage } from "@/components/notes/notes-page";

export const Route = createFileRoute("/_authed/dashboard/notes")({
	component: RouteComponent,
	loader: async ({ context: { queryClient, user } }) => {
		queryClient.prefetchQuery(fetchNotesByUserIdOptions({ userId: user.id }));
		queryClient.prefetchQuery(fetchAthleteActivitiesQueryOptions());
	},
});

function RouteComponent() {
	const { user, queryClient } = Route.useRouteContext();
	return (
		<Suspense fallback={<LoadingNotesPage />}>
			<NotesPage user={user} queryClient={queryClient} />
		</Suspense>
	);
}

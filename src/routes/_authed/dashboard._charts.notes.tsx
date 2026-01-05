import { createFileRoute } from "@tanstack/react-router";

import { fetchNotesByStravaIdQueryOptions } from "@/api/queries/notes";

import { NotesTable } from "@/components/tables/notes-table";

import { PendingComponent } from "./-pending-component";

export const Route = createFileRoute("/_authed/dashboard/_charts/notes")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,

	loader: async ({ context: { queryClient, athlete } }) => {
		// Fire-and-forget prefetch - don't block navigation
		queryClient.prefetchQuery(
			fetchNotesByStravaIdQueryOptions({ stravaId: athlete.id }),
		);
	},
	validateSearch: (search: Record<string, unknown>) => {
		// validate and parse the search params into a typed state
		return {
			year: search?.year ? Number(search.year) : undefined,
			month: search?.month ? String(search.month) : undefined,
		};
	},
});

function RouteComponent() {
	return <NotesTable />;
}

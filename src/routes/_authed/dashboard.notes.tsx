import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { fetchNotesByUserIdOptions } from "@/api/queries/notes";
import NotesPage, { LoadingNotesPage } from "@/components/notes/notes-page";

export const Route = createFileRoute("/_authed/dashboard/notes")({
	component: RouteComponent,
	loader: async ({ context: { queryClient, user } }) => {
		queryClient.prefetchQuery(fetchNotesByUserIdOptions({ userId: user.id }));
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<Suspense fallback={<LoadingNotesPage />}>
			<NotesPage user={user} />
		</Suspense>
	);
}

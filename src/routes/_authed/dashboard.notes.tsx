import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { fetchNotesByUserIdOptions } from "@/api/queries/notes";
import NotesPage from "@/components/notes/notes-page";

export const Route = createFileRoute("/_authed/dashboard/notes")({
	component: RouteComponent,
	loader: async ({ context: { queryClient, user } }) => {
		const notes = await queryClient.ensureQueryData(
			fetchNotesByUserIdOptions({ userId: user.id }),
		);

		return { notes };
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { data: notes } = useSuspenseQuery(
		fetchNotesByUserIdOptions({ userId: user.id }),
	);
	console.log(notes);
	return <NotesPage notes={notes.results} />;
}

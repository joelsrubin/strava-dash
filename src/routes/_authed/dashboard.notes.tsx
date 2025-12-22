import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { fetchNotesByUserIdOptions } from "@/api/queries/notes";

export const Route = createFileRoute("/_authed/dashboard/notes")({
	component: RouteComponent,
	loader: async ({ context: { queryClient, user } }) => {
		const notes = await queryClient.ensureQueryData(
			fetchNotesByUserIdOptions({ userId: user.id }),
		);
		console.log({ notes });
		return { notes };
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { data: notes } = useSuspenseQuery(
		fetchNotesByUserIdOptions({ userId: user.id }),
	);
	return (
		<div>
			Hello "/_authed/dashboard/notes"!
			<code>
				{notes.results.map((note) => (
					<pre className="wrap-break-word max-w-full" key={note.id}>
						{note.content}
					</pre>
				))}
			</code>
		</div>
	);
}

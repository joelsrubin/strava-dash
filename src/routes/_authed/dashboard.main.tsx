import { createFileRoute } from "@tanstack/react-router";

import { fetchAtheleteStats } from "@/api/client";

import { SidebarInset } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authed/dashboard/main")({
	component: RouteComponent,

	loader: async ({ context: { token, athlete } }) => {
		const athleteStats = await fetchAtheleteStats({
			token,
			athleteId: athlete.id,
		});
		return { athleteStats };
	},
});

function RouteComponent() {
	const { athleteStats } = Route.useLoaderData();
	console.log({ athleteStats });
	return (
		<SidebarInset>
			<div className="flex flex-1 flex-col gap-4 p-4">
				<div className="grid auto-rows-min gap-4 md:grid-cols-3">
					<div className="bg-muted/50 aspect-video rounded-xl" />
					<div className="bg-muted/50 aspect-video rounded-xl" />
					<div className="bg-muted/50 aspect-video rounded-xl" />
				</div>
				<div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
			</div>
		</SidebarInset>
	);
}

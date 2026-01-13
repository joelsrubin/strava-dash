import { createFileRoute, redirect } from "@tanstack/react-router";
import { exchangeStravaToken } from "@/api/auth.server";
import { PendingComponent } from "../_authed/-pending-component";
export const Route = createFileRoute("/exchange/")({
	validateSearch: (search) => ({
		code: (search.code as string) || undefined,
	}),
	beforeLoad: async ({ search }) => {
		const { code } = search;
		if (!code) {
			throw redirect({ to: "/" });
		}
		await exchangeStravaToken({ data: { code } });
		return { code };
	},
	component: ExchangeComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
});

function ExchangeComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<p>Authenticating with Strava...</p>
		</div>
	);
}

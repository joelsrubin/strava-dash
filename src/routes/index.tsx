import { createFileRoute, redirect } from "@tanstack/react-router";
import { getStravaAccessToken } from "@/api/auth.server";
import { Container } from "@/components/container";
import { LoginForm } from "@/components/login/login-form";
import { PendingComponent } from "./_authed/-pending-component";

export const Route = createFileRoute("/")({
	component: App,
	pendingComponent: PendingComponent,
	beforeLoad: async () => {
		const token = await getStravaAccessToken();
		if (token) {
			throw redirect({ to: "/dashboard" });
		}
		return null;
	},
});

function App() {
	return (
		<Container className="flex items-center justify-center h-screen">
			<LoginForm />
		</Container>
	);
}

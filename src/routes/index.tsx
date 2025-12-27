import { createFileRoute, redirect } from "@tanstack/react-router";
import { getStravaAccessToken } from "@/api/auth.server";
import { Container } from "@/components/container";
import { LoginForm } from "@/components/login/login-form";

export const Route = createFileRoute("/")({
	component: App,
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
		<Container>
			<LoginForm />
		</Container>
	);
}

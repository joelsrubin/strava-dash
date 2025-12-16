import { createFileRoute, redirect } from "@tanstack/react-router";
import { getStravaAccessToken } from "@/api/auth";
import { Container } from "@/components/container";
import { LoginForm } from "@/components/login/login-form";

export const Route = createFileRoute("/")({
	component: App,
	beforeLoad: async () => {
		const token = await getStravaAccessToken();
		if (token) {
			throw redirect({ to: "/dashboard/main" });
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

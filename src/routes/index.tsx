import { createFileRoute } from "@tanstack/react-router";

import { Container } from "@/components/container";
import { LoginForm } from "@/components/login/login-form";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<Container>
			<LoginForm />
		</Container>
	);
}

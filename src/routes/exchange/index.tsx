import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { exchangeToken } from "@/api/auth";

export const Route = createFileRoute("/exchange/")({
	validateSearch: (search) => ({
		code: (search.code as string) || undefined,
	}),
	component: ExchangeComponent,
});

function ExchangeComponent() {
	const { code } = Route.useSearch();
	const exchangeTokenFn = useServerFn(exchangeToken);
	useEffect(() => {
		if (!code) {
			window.location.href = "/";
			return;
		}

		const handleExchange = async () => {
			const result = await exchangeTokenFn({ data: { code } });

			if (!result.success) {
				window.location.href = "/";
				return;
			}

			// Full page reload to ensure cookie is sent with the request
			window.location.href = "/dashboard/main";
		};

		handleExchange();
	}, [code, exchangeTokenFn]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<p>Authenticating with Strava...</p>
		</div>
	);
}

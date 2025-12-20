import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { setStravaAccessToken } from "@/api/auth.server";
export const Route = createFileRoute("/exchange/")({
	validateSearch: (search) => ({
		code: (search.code as string) || undefined,
	}),
	component: ExchangeComponent,
});

function ExchangeComponent() {
	const { code } = Route.useSearch();

	useEffect(() => {
		if (!code) {
			window.location.href = "/";
			return;
		}

		const exchangeToken = async () => {
			const response = await fetch("https://www.strava.com/oauth/token", {
				method: "POST",
				body: new URLSearchParams({
					client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
					client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
					code,
					grant_type: "authorization_code",
				}),
			});

			if (!response.ok) {
				window.location.href = "/";
				return;
			}

			const data = (await response.json()) as {
				access_token: string;
				expires_at: number;
				refresh_token: string;
			};

			await setStravaAccessToken({
				data: {
					access_token: data.access_token,
					expires_at: data.expires_at,
					refresh_token: data.refresh_token,
				},
			});

			// Full page reload to ensure cookie is sent with the request
			window.location.href = "/dashboard/main";
		};

		exchangeToken();
	}, [code]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<p>Authenticating with Strava...</p>
		</div>
	);
}

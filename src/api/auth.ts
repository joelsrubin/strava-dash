import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { useStravaSession } from "./session";

export const refreshStravaAccessToken = createServerFn({
	method: "POST",
}).handler(async () => {
	const session = await useStravaSession();
	const refreshToken = session.data.refreshToken;

	if (!refreshToken) {
		throw new Error("No refresh token available");
	}

	const response = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		body: new URLSearchParams({
			client_id: env.VITE_STRAVA_CLIENT_ID,
			client_secret: env.VITE_STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to refresh Strava token");
	}

	const data = (await response.json()) as {
		access_token: string;
		expires_at: number;
		refresh_token: string;
	};

	await session.update({
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		expiresAt: data.expires_at,
	});

	return data.access_token;
});

export const getStravaAccessToken = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await useStravaSession();
		let accessToken = session.data.accessToken;

		// Check if token is expired
		const expiresAt = session.data.expiresAt;
		const isExpired = expiresAt && Date.now() / 1000 > expiresAt;

		if (!accessToken || isExpired) {
			if (session.data.refreshToken) {
				accessToken = await refreshStravaAccessToken();
			}
		}

		return accessToken;
	},
);

export const setStravaAccessToken = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			access_token: string;
			expires_at: number;
			refresh_token: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		const session = await useStravaSession();

		await session.update({
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresAt: data.expires_at,
		});

		return data.access_token;
	});

export const clearStravaSession = createServerFn({ method: "POST" }).handler(
	async () => {
		const session = await useStravaSession();
		await session.clear();
	},
);

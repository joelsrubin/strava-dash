import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

type TResponse = {
	access_token: string;
	expires_at: number;
	expires_in: number;
	refresh_token: string;
	token_type: string;
};

export const refreshStravaAccessToken = createServerFn({
	method: "POST",
}).handler(async () => {
	const response = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		body: new URLSearchParams({
			client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
			client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: import.meta.env.VITE_STRAVA_REFRESH_TOKEN,
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to login with Strava");
	}

	const data: TResponse = await response.json();

	setCookie("strava_access_token", data.access_token, {
		path: "/",
		maxAge: data.expires_in,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});
	return data;
});

export const getStravaAccessToken = createServerFn({ method: "GET" }).handler(
	async () => {
		let accessToken = getCookie("strava_access_token");
		if (!accessToken) {
			await refreshStravaAccessToken();
			accessToken = getCookie("strava_access_token");
		}

		return accessToken;
	},
);

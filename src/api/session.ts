import { env } from "cloudflare:workers";
import { useSession } from "@tanstack/react-start/server";

type SessionData = {
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
};

export function useStravaSession() {
	console.log({ env });
	return useSession<SessionData>({
		// password: env.VITE_SESSION_SECRET || "",
		password: env.VITE_SESSION_SECRET,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			httpOnly: true,
		},
	});
}

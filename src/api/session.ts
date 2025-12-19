import { useSession } from "@tanstack/react-start/server";

type SessionData = {
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
};

export function useStravaSession() {
	console.log("LOGGING SESSION SECRET", process.env.VITE_SESSION_SECRET);
	return useSession<SessionData>({
		password: process.env.VITE_SESSION_SECRET || "",
		cookie: {
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			httpOnly: true,
		},
	});
}

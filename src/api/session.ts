import { useSession } from "@tanstack/react-start/server";

type SessionData = {
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
	athlete?: TAthlete;
};
export function useStravaSession() {
	return useSession<SessionData>({
		password: process.env.VITE_SESSION_SECRET,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			httpOnly: true,
			maxAge: 24 * 60 * 60,
		},
	});
}

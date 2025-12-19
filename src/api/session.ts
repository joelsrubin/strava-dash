import { useSession } from "@tanstack/react-start/server";

type SessionData = {
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
};

export function useStravaSession() {
	return useSession<SessionData>({
		// password: env.VITE_SESSION_SECRET || "",
		password: "jonggtizgawbcikhaxqfzororcensbbn",
		cookie: {
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			httpOnly: true,
		},
	});
}

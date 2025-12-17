import { queryOptions } from "@tanstack/react-query";

import { getStravaAccessToken } from "./auth";

const BASE_URL = "https://www.strava.com/api/v3";

export const fetchAthlete = async (token?: string) => {
	const accessToken = token ?? (await getStravaAccessToken());
	if (!accessToken) throw new Error("No access token");

	const response = await fetch(`${BASE_URL}/athlete`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	return response.json() as Promise<TAthlete>;
};

export function fetchAthleteQueryOptions(opts?: { token?: string }) {
	return queryOptions({
		queryKey: ["athlete"],
		queryFn: () => fetchAthlete(opts?.token),
		staleTime: Infinity,
	});
}

export const fetchAthleteStats = async ({
	athleteId,
}: {
	athleteId: number;
}) => {
	const token = await getStravaAccessToken();
	const response = await fetch(`${BASE_URL}/athletes/${athleteId}/stats`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.json() as Promise<TAthleteStats>;
};

export function fetchAthleteStatsQueryOptions({
	athleteId,
}: {
	athleteId: number;
}) {
	return queryOptions({
		queryKey: ["athleteStats", athleteId],
		queryFn: () => fetchAthleteStats({ athleteId }),
		staleTime: Infinity,
	});
}

export const fetchAthleteActivities = async () => {
	const token = await getStravaAccessToken();
	const response = await fetch(`${BASE_URL}/athlete/activities`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.json() as Promise<TActivity[]>;
};

export function fetchAthleteActivitiesQueryOptions() {
	return queryOptions({
		queryKey: ["athleteActivities"],
		queryFn: () => fetchAthleteActivities(),
		staleTime: Infinity,
	});
}

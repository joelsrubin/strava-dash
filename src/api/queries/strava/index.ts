import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getStravaAccessToken } from "@/api/auth.server";

const BASE_URL = "https://www.strava.com/api/v3";

export const fetchAthlete = async () => {
	const accessToken = await getStravaAccessToken();
	if (!accessToken) throw new Error("No access token");

	const response = await fetch(`${BASE_URL}/athlete`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	return response.json() as Promise<TAthlete>;
};

export function fetchAthleteQueryOptions() {
	return queryOptions({
		queryKey: ["athlete"],
		queryFn: () => fetchAthlete(),
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

export const fetchAthleteActivities = async ({ page }: { page?: number }) => {
	const token = await getStravaAccessToken();
	const response = await fetch(
		`${BASE_URL}/athlete/activities?page=${page || 1}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);
	return response.json() as Promise<TActivity[]>;
};

export function fetchAthleteActivitiesQueryOptions() {
	return infiniteQueryOptions({
		queryKey: ["athlete-activities"],
		queryFn: ({ pageParam }) => fetchAthleteActivities({ page: pageParam }),
		staleTime: Infinity,
		initialPageParam: 1,
		getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
			return lastPageParam + 1;
		},
	});
}

export const fetchActivity = async (id: string) => {
	const token = await getStravaAccessToken();
	const response = await fetch(`${BASE_URL}/activities/${id}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.json() as Promise<TActivity>;
};

export function fetchActivityQueryOptions(id: string) {
	return queryOptions({
		queryKey: ["activity", id],
		queryFn: () => fetchActivity(id),
		staleTime: Infinity,
	});
}

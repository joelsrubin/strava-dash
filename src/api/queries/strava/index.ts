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

export const fetchAthleteActivities = async ({
	page = 1,
	per_page = 30,
	after,
}: {
	page?: number;
	per_page?: number;
	after?: number;
}) => {
	const token = await getStravaAccessToken();
	const params = new URLSearchParams();
	params.append("page", page.toString());
	params.append("per_page", per_page.toString());
	if (after) params.append("after", after.toString());

	const response = await fetch(
		`${BASE_URL}/athlete/activities?${params.toString()}`,
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
		queryFn: async ({ pageParam }) => {
			const data = await fetchAthleteActivities({ page: pageParam });
			const onlyRuns = data.filter((activity) => activity.type === "Run");
			return onlyRuns;
		},
		staleTime: Infinity,
		initialPageParam: 1,
		getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
			return lastPageParam + 1;
		},
	});
}

export function fetchAthleteActivitiesAllQueryOptions() {
	return queryOptions({
		queryKey: ["athlete-activities-all"],
		queryFn: async () => {
			// Calculate 12 weeks ago in seconds (epoch timestamp)
			const twelveWeeksAgo =
				Math.floor(Date.now() / 1000) - 12 * 7 * 24 * 60 * 60;

			const activities = await fetchAthleteActivities({
				per_page: 100,
				after: twelveWeeksAgo,
			});

			const onlyRuns = activities.filter((activity) => activity.type === "Run");

			return onlyRuns;
		},
		staleTime: Infinity,
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

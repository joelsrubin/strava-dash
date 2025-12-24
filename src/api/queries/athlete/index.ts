import { queryOptions } from "@tanstack/react-query";
import { getUserByStravaId } from "@/db";

export const fetchAthleteByStravaId = async ({
	stravaId,
}: {
	stravaId: number;
}) => {
	const note = await getUserByStravaId({ data: { strava_id: stravaId } });
	return note;
};

export function fetchAthleteByStravaIdQueryOptions({
	stravaId,
}: {
	stravaId: number;
}) {
	return queryOptions({
		queryKey: ["athlete", stravaId],
		queryFn: () => fetchAthleteByStravaId({ stravaId }),
		staleTime: Infinity,
	});
}

export const fetchAthleteByUser = async ({ userId }: { userId: number }) => {
	const note = await getUserByStravaId({ data: { strava_id: userId } });
	return note;
};

export function fetchAthleteByUserQueryOptions({ userId }: { userId: number }) {
	return queryOptions({
		queryKey: ["athlete", userId],
		queryFn: () => fetchAthleteByUser({ userId }),
		staleTime: Infinity,
	});
}

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

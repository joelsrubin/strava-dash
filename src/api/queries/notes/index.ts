import { queryOptions } from "@tanstack/react-query";
import { getNoteByRun, getNotesByUserId } from "@/db";

export const fetchNoteByRunId = async ({ runId }: { runId: number }) => {
	const note = await getNoteByRun({ data: { run_id: runId } });
	return note;
};

export function fetchNoteByRunIdQueryOptions({ runId }: { runId: number }) {
	return queryOptions({
		queryKey: ["note", runId],
		queryFn: () => fetchNoteByRunId({ runId }),
		staleTime: Infinity,
	});
}

export const fetchNotesByStravaId = async ({
	stravaId,
}: {
	stravaId: number;
}) => {
	const notes = await getNotesByUserId({ data: { strava_id: stravaId } });
	return notes;
};

export function fetchNotesByStravaIdQueryOptions({
	stravaId,
}: {
	stravaId: number;
}) {
	return queryOptions({
		queryKey: ["notes", stravaId],
		queryFn: () => fetchNotesByStravaId({ stravaId }),
		staleTime: Infinity,
	});
}

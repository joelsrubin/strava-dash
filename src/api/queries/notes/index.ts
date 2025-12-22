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

export const fetchNotesByStravaId = async ({ userId }: { userId: number }) => {
	const notes = await getNotesByUserId({ data: { user_id: userId } });
	return notes;
};

export function fetchNotesByUserIdOptions({ userId }: { userId: number }) {
	return queryOptions({
		queryKey: ["notes", userId],
		queryFn: () => fetchNotesByStravaId({ userId }),
		staleTime: Infinity,
	});
}

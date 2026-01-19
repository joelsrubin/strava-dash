import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { deleteNotes, type Note, upsertNote } from "@/db";

export const useUpsertNoteMutation = (
	options?: UseMutationOptions<
		void,
		Error,
		Pick<Note, "content" | "run_id" | "strava_id" | "activity_date">
	>,
) => {
	return useMutation({
		mutationFn: async ({
			content,
			run_id,
			strava_id,
			activity_date,
		}: {
			content: string;
			run_id: number;
			strava_id: number;
			activity_date: string;
		}) => {
			await upsertNote({ data: { content, run_id, strava_id, activity_date } });
		},
		mutationKey: ["notes-upsert"],
		...options,
	});
};

export const useDeleteNoteMutation = (
	options?: UseMutationOptions<void, Error, { runIds: number[] }>,
) => {
	return useMutation({
		mutationFn: async ({ runIds }: { runIds: number[] }) => {
			await deleteNotes({ data: { runIds } });
		},
		...options,
	});
};

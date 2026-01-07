import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { createNote, deleteNotes, type Note, updateNote } from "@/db";

export const useUpdateNoteMutation = (
	options?: UseMutationOptions<
		{ id: number },
		Error,
		{ id: number; content: string }
	>,
) => {
	return useMutation({
		mutationFn: async ({ id, content }: { id: number; content: string }) => {
			await updateNote({ data: { id, content } });
			return { id };
		},
		mutationKey: ["notes-update"],
		...options,
	});
};

export const useCreateNoteMutation = (
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
			await createNote({ data: { content, run_id, strava_id, activity_date } });
		},
		mutationKey: ["notes-create"],
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

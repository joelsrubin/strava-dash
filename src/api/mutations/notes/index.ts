import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { createNote, updateNote } from "@/db";

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
		...options,
	});
};

export const useCreateNoteMutation = (
	options?: UseMutationOptions<
		void,
		Error,
		{ content: string; run_id: number; user_id: number }
	>,
) => {
	return useMutation({
		mutationFn: async ({
			content,
			run_id,
			user_id,
		}: {
			content: string;
			run_id: number;
			user_id: number;
		}) => {
			await createNote({ data: { content, run_id, user_id } });
		},
		...options,
	});
};

import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { createUserIfNotExists } from "@/db";

export const useCreateAthleteMutation = (
	options?: UseMutationOptions<
		void,
		Error,
		{ name: string; strava_id: number }
	>,
) => {
	return useMutation({
		mutationFn: async ({
			name,
			strava_id,
		}: {
			name: string;
			strava_id: number;
		}) => {
			await createUserIfNotExists({ data: { name, strava_id } });
		},
		...options,
	});
};

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { toast } from "sonner";
import { useUpsertNoteMutation } from "@/api/mutations/notes";
import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import { fetchActivityQueryOptions } from "@/api/queries/strava";

import { useUnitOfMeasurement } from "@/lib/user-preferences";
import { formatDistance } from "@/lib/utils";
import Tiptap from "./tip-tap";

export function EditorComponent({
	id,
	queryClient,
	athlete,
}: {
	id: string;
	queryClient: QueryClient;
	athlete: TAthlete;
}) {
	const { data: note } = useSuspenseQuery(
		fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
	);

	const { data: activity } = useSuspenseQuery(fetchActivityQueryOptions(id));
	const { unitOfMeasurement } = useUnitOfMeasurement();
	const { mutate: upsertNoteFn } = useUpsertNoteMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notes", athlete.id] });
			queryClient.invalidateQueries({ queryKey: ["note", Number(id)] });
		},
		onError: () => {
			toast.error("Failed to save note");
		},
	});

	const defaultContent = `<p><b>${activity.name}</b> - ${formatDistance(activity.distance, unitOfMeasurement)} ${unitOfMeasurement}</p>`;
	const initialState = note?.results[0]?.content || defaultContent;

	const handleSave = async (content: string) => {
		upsertNoteFn({
			strava_id: Number(athlete.id),
			run_id: Number(id),
			activity_date: activity?.start_date,
			content,
		});
	};

	const debounceFn = useDebouncedCallback(handleSave, { wait: 500 });
	return (
		<div
			className={`flex min-h-0 flex-1 flex-col bg-muted/50 rounded-xl order-3 lg:order-4`}
		>
			<Tiptap initialContent={initialState} onUpdate={debounceFn} />
		</div>
	);
}

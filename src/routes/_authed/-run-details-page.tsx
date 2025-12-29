import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { Suspense } from "react";

import { toast } from "sonner";
import {
	useCreateNoteMutation,
	useUpdateNoteMutation,
} from "@/api/mutations/notes";

import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import {
	fetchActivityQueryOptions,
	fetchAthleteQueryOptions,
} from "@/api/queries/strava";
import ActivityMap from "@/components/activity-map/activity-map";
import Tiptap from "@/components/editor/tip-tap";

import { SidebarInset } from "@/components/ui/sidebar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useAutosave } from "@/hooks/use-autosave";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistance, formatTime } from "@/lib/utils";

export function RunDetailsPage({
	id,
	queryClient,
}: {
	id: string;

	queryClient: QueryClient;
}) {
	const { isMobile } = useIsMobile();

	const { data: activity } = useSuspenseQuery(fetchActivityQueryOptions(id));
	const { data: note } = useSuspenseQuery(
		fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
	);

	const { data: athlete } = useSuspenseQuery(fetchAthleteQueryOptions());

	const didInitializeWithNote = Boolean(
		note.results.length > 0 && note.results[0].id,
	);

	const { mutate: updateNoteFn, isPending: updateNoteIsPending } =
		useUpdateNoteMutation({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["notes", athlete.id] });
				queryClient.invalidateQueries({ queryKey: ["note", Number(id)] });
			},
			onError: () => {
				toast.error("Failed to update note");
			},
		});
	const { mutate: createNoteFn, isPending: createNoteIsPending } =
		useCreateNoteMutation({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["notes", athlete.id] });
				queryClient.invalidateQueries({ queryKey: ["note", Number(id)] });
			},
			onError: () => {
				toast.error("Failed to create note");
			},
		});

	const polyline = activity.map.polyline;

	const defaultContent = `<p><b>${activity.name}</b> - ${(activity.distance * 0.00062137).toFixed(2)} miles</p>`;
	const initialState = note?.results[0]?.content || defaultContent;

	const handleSave = async (content: string) => {
		if (didInitializeWithNote) {
			updateNoteFn({ id: note.results[0].id, content });
		} else {
			createNoteFn({
				strava_id: Number(athlete.id),
				run_id: Number(id),
				activity_date: activity?.start_date,
				content,
			});
		}
	};

	const { triggerSave } = useAutosave({
		onSave: (content) => handleSave(content),
		debounceMs: 2500,
	});

	return (
		<SidebarInset className={"flex min-h-0 flex-1 flex-col"}>
			<div className={"flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"}>
				<div className="grid auto-rows-min gap-4 grid-cols-1 lg:grid-cols-3 order-2 lg:order-1">
					<div className="bg-muted/50 rounded-xl p-2 col-span-2">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-base" colSpan={2}>
										Run Details
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="">
								<TableRow className="overflow-x-scroll">
									<TableCell className="py-2 font-medium">Name</TableCell>
									<TableCell className="py-2">{activity.name}</TableCell>
								</TableRow>
								<TableRow className="overflow-x-scroll">
									<TableCell className="py-2 font-medium">Distance</TableCell>
									<TableCell className="py-2">
										{formatDistance(activity.distance)}
									</TableCell>
								</TableRow>
								<TableRow className="overflow-x-scroll">
									<TableCell className="py-2 font-medium">
										Moving Time
									</TableCell>
									<TableCell className="py-2">
										{formatTime(activity.moving_time)}
									</TableCell>
								</TableRow>
								<TableRow className="overflow-x-scroll">
									<TableCell className="py-2 font-medium">Gear</TableCell>
									<TableCell className="py-2">{activity.gear.name}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="py-2 font-medium">Average HR</TableCell>
									<TableCell className="py-2">
										{activity.average_heartrate
											? `${activity.average_heartrate} bpm`
											: "no data"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="py-2 font-medium">
										Average Cadence
									</TableCell>
									<TableCell className="py-2">
										{activity.average_cadence
											? `${activity.average_cadence} spm`
											: "no data"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="py-2 font-medium">Sport Type</TableCell>
									<TableCell className="py-2">{activity.sport_type}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>

					{!isMobile && (
						<div className="bg-muted/50 rounded-xl order-4 lg:order-3">
							<h2 className="p-2">Route Preview</h2>
							<Suspense>
								<ActivityMap encodedPolyline={polyline || ""} />
							</Suspense>
						</div>
					)}
				</div>
				<div
					className={`flex min-h-0 flex-1 flex-col bg-muted/50 rounded-xl order-3 lg:order-4 ${isMobile ? "max-h-[60vh]" : ""}`}
				>
					<Tiptap
						initialContent={initialState}
						onChange={triggerSave}
						isPending={updateNoteIsPending || createNoteIsPending}
					/>
				</div>
			</div>
		</SidebarInset>
	);
}

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Suspense } from "react";
import { toast } from "sonner";
import {
	useCreateNoteMutation,
	useUpdateNoteMutation,
} from "@/api/mutations/notes";
import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import { fetchActivityQueryOptions } from "@/api/queries/strava";
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
import { formatDistance, formatPace, formatTime } from "@/lib/utils";
import { PendingComponent } from "./-pending-component";

export const Route = createFileRoute("/_authed/dashboard/run/$id")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: async ({ context: { queryClient }, params: { id } }) => {
		await queryClient.ensureQueryData(fetchActivityQueryOptions(id));
		await queryClient.ensureQueryData(
			fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
		);
	},
});

export function RouteComponent() {
	const { id } = Route.useParams();
	const { queryClient } = Route.useRouteContext();
	const { isMobile } = useIsMobile();
	const { athlete } = useRouteContext({ from: "/_authed/dashboard/run/$id" });
	const { data: activity } = useSuspenseQuery(fetchActivityQueryOptions(id));
	const { data: note } = useSuspenseQuery(
		fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
	);

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
							<TableBody>
								<DetailsTableRow
									label="Distance"
									value={formatDistance(activity.distance)}
								/>
								<DetailsTableRow
									label="Moving Time"
									value={formatTime(activity.moving_time)}
								/>

								<DetailsTableRow
									label="Average HR"
									value={activity.average_heartrate?.toFixed(0)}
									type="heartrate"
								/>
								<DetailsTableRow
									label="Average Pace"
									value={formatPace(activity.average_speed)}
									type="pace"
								/>

								<DetailsTableRow
									label="Gear"
									value={activity.gear?.name || "No gear"}
								/>
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

function DetailsTableRow({
	label,
	value,
	type,
}: {
	label: string;
	value: string | number;
	type?: "heartrate" | "pace";
}) {
	if (!value) return null;
	const suffix = !type ? "" : type === "heartrate" ? " bpm" : " min/mi";
	return (
		<TableRow>
			<TableCell className="py-2 font-medium">{label}</TableCell>
			<TableCell className="py-2 whitespace-normal wrap-break-word">
				{`${value} ${suffix}`}
			</TableCell>
		</TableRow>
	);
}

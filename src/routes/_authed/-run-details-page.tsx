import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { Suspense } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import {
	useCreateNoteMutation,
	useUpdateNoteMutation,
} from "@/api/mutations/notes";
import { fetchAthleteByStravaIdQueryOptions } from "@/api/queries/athlete";
import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import { fetchActivityQueryOptions } from "@/api/queries/strava";
import ActivityMap from "@/components/activity-map/activity-map";
import Tiptap from "@/components/editor/tip-tap";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { SidebarInset } from "@/components/ui/sidebar";

import type { User } from "@/db";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistance, formatTime } from "@/lib/utils";

export function RunDetailsPage({
	id,
	user,
	queryClient,
}: {
	id: string;
	user: User;
	queryClient: QueryClient;
}) {
	const { isMobile } = useIsMobile();

	const { data: activity } = useSuspenseQuery(fetchActivityQueryOptions(id));
	const { data: note } = useSuspenseQuery(
		fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
	);

	const { data: athlete } = useSuspenseQuery(
		fetchAthleteByStravaIdQueryOptions({
			stravaId: Number(activity.athlete.id),
		}),
	);

	const didInitializeWithNote = Boolean(
		note.results.length > 0 && note.results[0].id,
	);

	const { mutate: updateNoteFn, isPending: updateNoteIsPending } =
		useUpdateNoteMutation({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["notes", user.id] });
				queryClient.invalidateQueries({ queryKey: ["note", Number(id)] });
				toast.success("Note updated");
			},
			onError: () => {
				toast.error("Failed to update note");
			},
		});
	const { mutate: createNoteFn, isPending: createNoteIsPending } =
		useCreateNoteMutation({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["notes", user.id] });
				queryClient.invalidateQueries({ queryKey: ["note", Number(id)] });
				toast.success("Note created");
			},
			onError: () => {
				toast.error("Failed to create note");
			},
		});

	const polyline = activity.map.polyline;

	const defaultContent = `<p><b>${activity.name}</b> - ${(activity.distance * 0.00062137).toFixed(2)} miles</p>`;
	const initialState = note?.results[0]?.content || defaultContent;

	const splitsData = activity.splits_standard.map((split) => ({
		split: `Mile ${split.split}`,
		distance: Number((split.distance * 0.00062137).toFixed(2)),
		heartRate: split.average_heartrate,
		paceZone: split.pace_zone,
	}));

	const splitsConfig = {
		...(activity.average_heartrate && {
			heartRate: {
				label: "Avg Heart Rate",
				color: "var(--primary)",
			},
		}),
		...{
			paceZone: {
				label: "Pace Zone",
				color: "dodgerblue",
			},
		},
	} satisfies ChartConfig;

	const min =
		Number(Math.min(...splitsData.map((split) => split.heartRate)).toFixed(0)) -
		1;
	const max =
		Number(Math.max(...splitsData.map((split) => split.heartRate)).toFixed(0)) +
		1;

	return (
		<SidebarInset className={"flex min-h-0 flex-1 flex-col"}>
			<div className={"flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"}>
				<div className="grid auto-rows-min gap-4 grid-cols-1 lg:grid-cols-3 order-2 lg:order-1">
					<div className="bg-muted/50 rounded-xl p-2 hidden flex-col gap-2 lg:flex">
						<h2>Run Details</h2>
						<span>name: {activity.name}</span>
						<span>distance: {formatDistance(activity.distance)}</span>
						<span>moving_time: {formatTime(activity.moving_time)}</span>
						<span>elapsed_time: {formatTime(activity.elapsed_time)}</span>
						<span>sport_type: {activity.sport_type}</span>
					</div>
					<div className="bg-muted/50 rounded-xl md:col-span-1 order-3 lg:order-2">
						<h2 className="p-2">Splits Performance</h2>
						<ChartContainer config={splitsConfig} className="">
							<LineChart data={splitsData}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="split"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									fontSize={12}
								/>
								<YAxis
									yAxisId="heartRate"
									orientation="left"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									fontSize={12}
									domain={[min, max]}
								/>
								<YAxis
									yAxisId="paceZone"
									orientation="right"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									fontSize={12}
									domain={[0, 5]}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value, name) => {
												if (name === "heartRate")
													return `${(value as number).toFixed(0)} bpm`;
												if (name === "paceZone") return `Zone ${value}`;
												return value;
											}}
										/>
									}
								/>
								<ChartLegend content={<ChartLegendContent />} />
								<Line
									yAxisId="heartRate"
									type="monotone"
									dataKey="heartRate"
									stroke="var(--color-heartRate)"
									strokeWidth={2}
									dot={{ fill: "var(--color-heartRate)", r: 4 }}
								/>
								<Line
									yAxisId="paceZone"
									type="monotone"
									dataKey="paceZone"
									stroke="var(--color-paceZone)"
									strokeWidth={2}
									dot={{ fill: "var(--color-paceZone)", r: 4 }}
								/>
							</LineChart>
						</ChartContainer>
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
					className={`flex min-h-0 flex-1 flex-col bg-muted/50 rounded-xl order-1 lg:order-4 ${isMobile ? "max-h-[60vh]" : ""}`}
				>
					<Tiptap
						initialContent={initialState}
						onSave={async (content) => {
							if (didInitializeWithNote) {
								updateNoteFn({ id: note.results[0].id, content });
							} else {
								createNoteFn({
									user_id: Number(athlete.results[0].id),
									run_id: Number(id),
									activity_date: activity?.start_date,
									content,
								});
							}
						}}
						isPending={updateNoteIsPending || createNoteIsPending}
					/>
				</div>
			</div>
		</SidebarInset>
	);
}

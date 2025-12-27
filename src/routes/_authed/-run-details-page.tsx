import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { Suspense } from "react";
// import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
// import {
// 	type ChartConfig,
// 	ChartContainer,
// 	ChartLegend,
// 	ChartLegendContent,
// 	ChartTooltip,
// 	ChartTooltipContent,
// } from "@/components/ui/chart";
import { SidebarInset } from "@/components/ui/sidebar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import type { User } from "@/db";
import { useAutosave } from "@/hooks/use-autosave";
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
				user_id: Number(athlete.results[0].id),
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

	// const splitsData = activity.splits_standard.map((split) => ({
	// 	split: `Mile ${split.split}`,
	// 	distance: Number((split.distance * 0.00062137).toFixed(2)),
	// 	heartRate: split.average_heartrate,
	// 	paceZone: split.pace_zone,
	// }));

	// const splitsConfig = {
	// 	...(activity.average_heartrate && {
	// 		heartRate: {
	// 			label: "Avg Heart Rate",
	// 			color: "var(--primary)",
	// 		},
	// 	}),
	// 	...{
	// 		paceZone: {
	// 			label: "Pace Zone",
	// 			color: "dodgerblue",
	// 		},
	// 	},
	// } satisfies ChartConfig;

	// const min =
	// 	Number(Math.min(...splitsData.map((split) => split.heartRate)).toFixed(0)) -
	// 	1;
	// const max =
	// 	Number(Math.max(...splitsData.map((split) => split.heartRate)).toFixed(0)) +
	// 	1;

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
										{`${activity.average_heartrate} bpm`}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="py-2 font-medium">
										Average Cadence
									</TableCell>
									<TableCell className="py-2">
										{`${activity.average_cadence} spm`}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="py-2 font-medium">Sport Type</TableCell>
									<TableCell className="py-2">{activity.sport_type}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>
					{/* <div className="bg-muted/50 rounded-xl hidden lg:block md:col-span-1 order-1 lg:order-2">
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
					</div> */}
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

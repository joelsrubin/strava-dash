import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { fetchActivityQueryOptions } from "@/api/client";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistance, formatTime } from "@/lib/utils";

export const Route = createFileRoute("/_authed/dashboard/run/$id")({
	component: RouteComponent,

	loader: async ({ context: { queryClient }, params: { id } }) => {
		await queryClient.ensureQueryData(fetchActivityQueryOptions(id));
	},
});

function RouteComponent() {
	const isMobile = useIsMobile();
	const { id } = Route.useParams();
	const { data: activity } = useSuspenseQuery(fetchActivityQueryOptions(id));
	const initialState =
		localStorage.getItem(`editor-state-${id}`) ||
		`<p>${activity.name} - ${(activity.distance * 0.00062137).toFixed(2)} miles</p>`;

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
				color: "#FF0800",
			},
		}),
		...{
			paceZone: {
				label: "Pace Zone",
				color: "#2563eb",
			},
		},
	} satisfies ChartConfig;

	const handleChange = (content: string) => {
		console.log("content", content);
		localStorage.setItem(`editor-state-${id}`, content);
	};

	return (
		<SidebarInset
			className={
				isMobile
					? "flex flex-1 flex-col overflow-auto"
					: "flex min-h-0 flex-1 flex-col"
			}
		>
			<div
				className={
					isMobile
						? "flex flex-1 flex-col gap-4 p-4"
						: "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"
				}
			>
				<div className="grid auto-rows-min gap-4 md:grid-cols-3">
					<div className="bg-muted/50 rounded-xl p-2 flex flex-col gap-2">
						<h2>Run Details</h2>
						<span>name: {activity.name}</span>
						<span>distance: {formatDistance(activity.distance)}</span>
						<span>moving_time: {formatTime(activity.moving_time)}</span>
						<span>elapsed_time: {formatTime(activity.elapsed_time)}</span>
						<span>sport_type: {activity.sport_type}</span>
					</div>
					<div className="bg-muted/50 rounded-xl md:col-span-2">
						<h2 className="p-2">Splits Performance</h2>
						<ChartContainer config={splitsConfig} className="h-[250px] w-full">
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
									domain={[120, 180]}
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
				</div>
				<div
					className={
						isMobile
							? "bg-muted/50 flex flex-1 flex-col rounded-xl"
							: "bg-muted/50 flex min-h-0 flex-1 flex-col rounded-xl"
					}
				>
					<Tiptap onChange={handleChange} initialContent={initialState} />
				</div>
			</div>
		</SidebarInset>
	);
}

import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	type LabelProps,
	ReferenceLine,
} from "recharts";
import { fetchAthleteActivitiesAllQueryOptions } from "@/api/queries/strava";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnitOfMeasurement } from "@/lib/user-preferences";
import { formatDistance } from "@/lib/utils";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../ui/chart";

export function DistanceChart() {
	const { data: athleteActivities } = useSuspenseQuery(
		fetchAthleteActivitiesAllQueryOptions(),
	);
	const { unitOfMeasurement } = useUnitOfMeasurement();
	const activitesToChart = athleteActivities;
	const { isMobile } = useIsMobile();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const { weeklyDistanceData, averageDistance } = useMemo(() => {
		const weeklyMap = new Map<string, number>();

		activitesToChart.forEach((activity) => {
			if (activity.start_date && activity.distance) {
				const date = new Date(activity.start_date);
				const weekStart = new Date(date);
				weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
				const weekKey = weekStart.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				});

				const currentTotal = weeklyMap.get(weekKey) || 0;
				weeklyMap.set(weekKey, currentTotal + activity.distance);
			}
		});

		const data = Array.from(weeklyMap.entries())
			.map(([week, distance]) => ({
				week,
				distance,
			}))
			.reverse();

		const average =
			data.length > 0
				? data.reduce((sum, item) => sum + item.distance, 0) / data.length
				: 0;

		return { weeklyDistanceData: data, averageDistance: average };
	}, [activitesToChart]);
	const highestDistance = weeklyDistanceData.reduce(
		(max, item) => Math.max(max, item.distance),
		0,
	);

	const renderCustomizedLabel = (props: LabelProps) => {
		const { x, y, width, value } = props;
		if (x == null || y == null || width == null) {
			return null;
		}

		if (value !== highestDistance) {
			return null;
		}

		return (
			<g>
				<text
					x={Number(x) + Number(width) / 2}
					y={Number(y) - 10}
					className="fill-accent-foreground"
					textAnchor="middle"
					dominantBaseline="middle"
				>
					{formatDistance(value as number, unitOfMeasurement)}
				</text>
			</g>
		);
	};

	const distanceConfig = useMemo<ChartConfig>(
		() => ({
			distance: {
				label: "weekly distance",
				color: "var(--primary)",
			},
		}),
		[],
	);

	return (
		<ChartContainer config={distanceConfig}>
			<BarChart accessibilityLayer className="w-full" data={weeklyDistanceData}>
				<CartesianGrid vertical={false} />

				{isMobile ? null : (
					<ChartTooltip
						content={
							<ChartTooltipContent
								labelFormatter={(_label, payload) => {
									return `Week of ${payload[0].payload.week}`;
								}}
								nameKey="distance"
								formatter={(value) => [
									formatDistance(value as number, unitOfMeasurement),
								]}
							/>
						}
					/>
				)}
				<ReferenceLine
					y={averageDistance}
					stroke="var(--chart-4)"
					strokeDasharray="5 5"
					opacity={"40%"}
				/>
				<Bar
					isAnimationActive={false}
					dataKey="distance"
					fill="var(--color-distance)"
					radius={2}
					barSize={30}
				>
					<LabelList dataKey="distance" content={renderCustomizedLabel} />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}

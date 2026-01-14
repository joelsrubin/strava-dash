import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine } from "recharts";
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
					// label={{
					// 	value: `Avg: ${formatDistance(averageDistance, unitOfMeasurement)}`,
					// 	position: "top",
					// 	fill: "var(--chart-4)",
					// 	fontSize: 12,
					// }}
				/>
				<Bar
					isAnimationActive={false}
					dataKey="distance"
					fill="var(--color-distance)"
					radius={2}
					barSize={30}
				/>
			</BarChart>
		</ChartContainer>
	);
}

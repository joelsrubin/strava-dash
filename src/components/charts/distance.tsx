import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid } from "recharts";
import { fetchAthleteActivitiesAllQueryOptions } from "@/api/queries/strava";
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

	const weeklyDistanceData = useMemo(() => {
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

		return (
			Array.from(weeklyMap.entries())
				.map(([week, distance]) => ({
					week,
					distance,
				}))
				// Show last 12 weeks
				.reverse()
		);
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

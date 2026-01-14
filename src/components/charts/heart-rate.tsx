import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
import { type ChartConfig, ChartContainer } from "../ui/chart";

export function HeartRateChart() {
	const { data: athleteActivities } = useSuspenseInfiniteQuery(
		fetchAthleteActivitiesQueryOptions(),
	);
	const activitesToChart = athleteActivities.pages[0];
	const heartRateConfig = useMemo<ChartConfig>(
		() => ({
			heartRate: {
				label: "Heart Rate",
				color: "var(--primary)",
			},
		}),
		[],
	);

	const heartRateData = useMemo(
		() =>
			activitesToChart
				.map((activity) => ({
					heartRate: activity.average_heartrate,
				}))
				.reverse(),
		[activitesToChart],
	);
	return (
		<ChartContainer config={heartRateConfig}>
			<AreaChart className=" w-full" data={heartRateData}>
				<CartesianGrid vertical={false} />
				<Area
					isAnimationActive={false}
					dataKey="heartRate"
					fill="var(--color-heartRate)"
					stroke="var(--color-heartRate)"
					strokeWidth={2}
					connectNulls
				/>
			</AreaChart>
		</ChartContainer>
	);
}

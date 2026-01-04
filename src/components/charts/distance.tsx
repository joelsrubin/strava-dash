import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid } from "recharts";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../ui/chart";

export function DistanceChart() {
	const { data: athleteActivities } = useSuspenseInfiniteQuery(
		fetchAthleteActivitiesQueryOptions(),
	);
	const activitesToChart = athleteActivities.pages[0];
	const distanceData = useMemo(
		() =>
			activitesToChart
				.map((activity, index) => ({
					distance: activity.distance || activitesToChart[index - 1]?.distance,
				}))
				.reverse(),
		[activitesToChart],
	);

	const distanceConfig = useMemo<ChartConfig>(
		() => ({
			distance: {
				label: "Distance",
				color: "var(--primary)",
			},
		}),
		[],
	);
	return (
		<ChartContainer config={distanceConfig}>
			<BarChart className=" w-full" data={distanceData}>
				<CartesianGrid vertical={false} />
				<Bar
					isAnimationActive={false}
					dataKey="distance"
					fill="var(--color-distance)"
					radius={4}
				/>

				<ChartTooltip
					content={
						<ChartTooltipContent
							formatter={(value) =>
								`${((value as number) * 0.00062137).toFixed(0)} mi`
							}
						/>
					}
				/>
			</BarChart>
		</ChartContainer>
	);
}

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
	const effortConfig = useMemo<ChartConfig>(
		() => ({
			effort: {
				color: "var(--primary)",
			},
		}),
		[],
	);

	const effortData = useMemo(
		() =>
			activitesToChart
				.map((activity) => ({
					effort: activity.weighted_average_watts,
				}))
				.reverse(),
		[activitesToChart],
	);

	return (
		<ChartContainer config={effortConfig}>
			<AreaChart className=" w-full" data={effortData}>
				<defs>
					<linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="45%"
							stopColor="var(--color-primary)"
							stopOpacity={0.8}
						/>
						<stop
							offset="95%"
							stopColor="var(--color-primary)"
							stopOpacity={0.1}
						/>
					</linearGradient>
				</defs>
				<CartesianGrid vertical={false} />

				<Area
					isAnimationActive={false}
					dataKey="effort"
					fill="url(#fillDesktop)"
					stroke="var(--color-effort)"
					strokeWidth={2}
					connectNulls
					type="natural"
				/>
			</AreaChart>
		</ChartContainer>
	);
}

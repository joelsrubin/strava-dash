import { useSuspenseQuery } from "@tanstack/react-query";
import { HeartPulse } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid } from "recharts";
import { fetchAthleteActivitiesAllQueryOptions } from "@/api/queries/strava";
import { type ChartConfig, ChartContainer } from "../ui/chart";

export function HeartRateChart() {
	const { data: athleteActivities } = useSuspenseQuery(
		fetchAthleteActivitiesAllQueryOptions(),
	);

	const hasHeartRateData = useMemo(
		() => athleteActivities.some((activity) => activity.has_heartrate),
		[athleteActivities],
	);

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
			athleteActivities.map((activity) => ({
				effort: activity.weighted_average_watts,
			})),
		[athleteActivities],
	);

	return (
		<div className="relative">
			<div className={hasHeartRateData ? "" : "blur-sm"}>
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
			</div>
			{!hasHeartRateData && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
					<HeartPulse className="h-8 w-8 text-muted-foreground" />
					<p className="text-sm text-muted-foreground max-w-[200px]">
						Start tracking heart rate to unlock the effort chart
					</p>
				</div>
			)}
		</div>
	);
}

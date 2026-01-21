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

	const { weeklyDistanceData, averageDistance } = useMemo(() => {
		if (!activitesToChart)
			return { weeklyDistanceData: [], averageDistance: 0 };

		const activitiesByDate = activitesToChart.reduce(
			(acc: Record<string, (typeof activitesToChart)[number][]>, activity) => {
				if (activity.start_date && activity.distance) {
					const date = new Date(activity.start_date)
						.toISOString()
						.split("T")[0];
					if (!acc[date]) acc[date] = [];
					acc[date].push(activity);
				}
				return acc;
			},
			{},
		);

		const weeks = 12;
		const daysPerWeek = 7;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const endOfWeek = new Date(today);
		const daysUntilSunday = (7 - today.getDay()) % 7;
		endOfWeek.setDate(today.getDate() + daysUntilSunday);

		const startDate = new Date(endOfWeek);
		startDate.setDate(endOfWeek.getDate() - (weeks * 7 - 1));

		const weeklyData = [];

		for (let week = 0; week < weeks; week++) {
			let weekDistance = 0;
			const weekStart = new Date(startDate);
			weekStart.setDate(startDate.getDate() + week * 7);

			for (let day = 0; day < daysPerWeek; day++) {
				const currentDate = new Date(weekStart);
				currentDate.setDate(weekStart.getDate() + day);

				const dateKey = currentDate.toISOString().split("T")[0];
				const dayActivities = activitiesByDate[dateKey] || [];

				dayActivities.forEach((activity) => {
					weekDistance += activity.distance || 0;
				});
			}

			weeklyData.push({
				week: weekStart.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				distance: weekDistance,
				weekDate: new Date(weekStart),
			});
		}

		const average =
			weeklyData.length > 0
				? weeklyData.reduce((sum, item) => sum + item.distance, 0) /
					weeklyData.length
				: 0;

		return { weeklyDistanceData: weeklyData, averageDistance: average };
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

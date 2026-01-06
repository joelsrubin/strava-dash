import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { fetchAthleteActivitiesQueryOptions } from "@/api/queries/strava";

export default function TimeRadar() {
	const { data: athleteActivities } = useSuspenseInfiniteQuery(
		fetchAthleteActivitiesQueryOptions(),
	);
	const runs = athleteActivities.pages[0];
	const radarData = useMemo(() => {
		const timeBlocks = [
			{ block: "Early (5-6)", hours: [5, 6], runs: 0 },
			{ block: "7 AM", hours: [7], runs: 0 },
			{ block: "8 AM", hours: [8], runs: 0 },
			{ block: "9 AM", hours: [9], runs: 0 },
			{ block: "Late AM", hours: [10, 11], runs: 0 },
			{ block: "Afternoon", hours: [12, 13, 14, 15, 16], runs: 0 },
			{ block: "Evening", hours: [17, 18, 19, 20, 21], runs: 0 },
		];

		runs.forEach((run) => {
			const hour = Number(run.start_date_local.split("T")[1].split(":")[0]);

			const block = timeBlocks.find((b) => b.hours.includes(hour));

			if (block) block.runs++;
		});

		return timeBlocks.map((b) => ({ block: b.block, runs: b.runs }));
	}, [runs]);

	return (
		<div className="rounded-xl">
			<ResponsiveContainer>
				<RadarChart data={radarData}>
					<PolarGrid stroke="#374151" />
					<PolarAngleAxis
						dataKey="block"
						tick={{ fill: "#9ca3af", fontSize: 11 }}
					/>
					<PolarRadiusAxis
						angle={90}
						domain={[0, "auto"]}
						tick={{ fill: "#6b7280", fontSize: 10 }}
					/>
					<Radar
						name="Runs"
						dataKey="runs"
						stroke="var(--primary)"
						fill="var(--primary)"
						fillOpacity={0.4}
						strokeWidth={2}
					/>
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);
}

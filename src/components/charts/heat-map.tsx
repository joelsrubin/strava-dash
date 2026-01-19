import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAthleteActivitiesAllQueryOptions } from "@/api/queries/strava";

interface Activity {
	id: number;
	distance: number;
	moving_time: number;
	start_date: string;
	average_heartrate?: number;
	suffer_score?: number;
}

const getIntensityColor = (intensity: number) => {
	const colors = [
		"bg-muted", // No activity
		"bg-amber-200 dark:bg-amber-900/40", // Light
		"bg-amber-400 dark:bg-amber-700/60", // Medium
		"bg-amber-600 dark:bg-amber-600/80", // High
		"bg-amber-800 dark:bg-amber-500", // Very high
	];
	return colors[intensity] || colors[0];
};

const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function ActivityHeatmap() {
	const { data: activities } = useSuspenseQuery(
		fetchAthleteActivitiesAllQueryOptions(),
	);

	const [hoveredCell, setHoveredCell] = useState<{
		date: string;
		value: number;
		x: number;
		y: number;
	} | null>(null);

	const handleMouseEnter = (
		cell: { date: string; value: number },
		event: React.MouseEvent<HTMLDivElement>,
	) => {
		const rect = event.currentTarget.getBoundingClientRect();
		setHoveredCell({
			date: cell.date,
			value: cell.value,
			x: rect.left + rect.width / 2,
			y: rect.top,
		});
	};

	const heatmapData = useMemo(() => {
		if (!activities) return [];

		// Group activities by date
		const activitiesByDate = activities.reduce(
			(acc: Record<string, Activity[]>, activity: Activity) => {
				const date = new Date(activity.start_date).toISOString().split("T")[0];
				if (!acc[date]) acc[date] = [];
				acc[date].push(activity);
				return acc;
			},
			{},
		);

		const weeks = 12;
		const daysPerWeek = 7;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const data = [];

		// Find the end of the current week (Sunday)
		const endOfWeek = new Date(today);
		const daysUntilSunday = (7 - today.getDay()) % 7;
		endOfWeek.setDate(today.getDate() + daysUntilSunday);

		// Calculate start date (beginning of the first week, which is a Monday)
		const startDate = new Date(endOfWeek);
		startDate.setDate(endOfWeek.getDate() - (weeks * 7 - 1));

		for (let week = 0; week < weeks; week++) {
			const weekData = [];

			for (let day = 0; day < daysPerWeek; day++) {
				const currentDate = new Date(startDate);
				currentDate.setDate(startDate.getDate() + week * 7 + day);

				const dateKey = currentDate.toISOString().split("T")[0];
				const dayActivities = activitiesByDate[dateKey] || [];

				// Calculate intensity based on distance
				let intensity = 0;
				let value = 0;

				if (dayActivities.length > 0) {
					const totalDistance = dayActivities.reduce(
						(sum, activity) => sum + (activity.distance || 0),
						0,
					);

					// Convert distance to miles
					const distanceMiles = totalDistance * 0.000621371;
					value = parseFloat(distanceMiles.toFixed(1));

					// Calculate intensity (0-4) based on distance
					if (distanceMiles > 0) {
						if (distanceMiles < 3) intensity = 1;
						else if (distanceMiles < 5) intensity = 2;
						else if (distanceMiles < 8) intensity = 3;
						else intensity = 4;
					}
				}

				weekData.push({
					week,
					day,
					intensity,
					date: currentDate.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
					value,
				});
			}
			data.push(weekData);
		}

		return data;
	}, [activities]);

	if (!activities) return null;

	return (
		<div className="flex-1 flex flex-col p-2">
			<div className="relative h-full flex flex-col">
				<div
					className="flex-1 grid gap-1"
					style={{
						gridTemplateColumns: `auto repeat(12, minmax(0, 1fr))`,
						gridTemplateRows: `repeat(7, minmax(0, 1fr))`,
					}}
				>
					{/* Day labels in first column */}
					{dayLabels.map((label, index) => (
						<div
							key={label}
							className="text-xs text-muted-foreground flex items-center justify-end pr-2"
							style={{ gridColumn: 1, gridRow: index + 1 }}
						>
							{label}
						</div>
					))}
					{/* Activity cells */}
					{heatmapData.map((week, weekIndex) =>
						week.map((cell) => (
							// biome-ignore lint/a11y/noStaticElementInteractions: ok
							<div
								key={`${weekIndex}-${cell.date}`}
								className={`aspect-square rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-ring hover:scale-110 ${getIntensityColor(
									cell.intensity,
								)}`}
								style={{ gridColumn: weekIndex + 2, gridRow: cell.day + 1 }}
								onMouseEnter={(e) =>
									handleMouseEnter({ date: cell.date, value: cell.value }, e)
								}
								onMouseLeave={() => setHoveredCell(null)}
								title={`${cell.date}: ${cell.value > 0 ? `${cell.value.toFixed(1)} miles` : "No activity"}`}
							/>
						)),
					)}
				</div>
				{hoveredCell && hoveredCell?.value > 0 ? (
					<div
						className="fixed bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md text-sm whitespace-nowrap border z-50 pointer-events-none"
						style={{
							left: `${hoveredCell.x}px`,
							top: `${hoveredCell.y - 10}px`,
							transform: "translate(-50%, -100%)",
						}}
					>
						<div className="font-medium">{hoveredCell.date}</div>
						<div className="text-muted-foreground">
							{hoveredCell.value.toFixed(1)} miles
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

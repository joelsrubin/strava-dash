import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { fetchNoteByRunIdQueryOptions } from "@/api/queries/notes";
import { fetchActivityQueryOptions } from "@/api/queries/strava";
import ActivityMap from "@/components/activity-map/activity-map";
import { EditorComponent } from "@/components/editor/editor-component";

import { Button } from "@/components/ui/button";
import { ChartLoader } from "@/components/ui/loaders/chart-loader";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnitOfMeasurement } from "@/lib/user-preferences";
import { formatDistance, formatPace, formatTime } from "@/lib/utils";
import { PendingComponent } from "./-pending-component";

export const Route = createFileRoute("/_authed/dashboard/run/$id")({
	component: RouteComponent,
	pendingComponent: PendingComponent,
	pendingMinMs: 0,
	loader: async ({ context: { queryClient }, params: { id } }) => {
		queryClient.prefetchQuery(fetchActivityQueryOptions(id));
		queryClient.prefetchQuery(
			fetchNoteByRunIdQueryOptions({ runId: Number(id) }),
		);
	},
});

export function RouteComponent() {
	const { id } = Route.useParams();
	const { queryClient, athlete } = Route.useRouteContext();
	const { isMobile } = useIsMobile();
	const { unitOfMeasurement } = useUnitOfMeasurement();
	const { data: activity } = useSuspenseQuery(fetchActivityQueryOptions(id));

	const polyline = activity.map.polyline;

	return (
		<div className={"flex min-h-0 flex-1 flex-col"}>
			<Link
				to={"/dashboard"}
				search={(prev) => ({
					tab: prev.tab,
				})}
				className="pt-4"
			>
				<Button variant="link" className="text-foreground">
					<ChevronLeft />
					Back to Dash
				</Button>
			</Link>
			<div className={"flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4"}>
				<div className="grid auto-rows-min gap-4 grid-cols-1 md:grid-cols-3 order-2 lg:order-1">
					<div className="bg-muted/50 rounded-xl p-2 col-span-2">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="text-base" colSpan={2}>
										Run Details
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<DetailsTableRow
									label="Distance"
									value={formatDistance(activity.distance, unitOfMeasurement)}
									unitOfMeasurement={unitOfMeasurement}
								/>
								<DetailsTableRow
									label="Moving Time"
									value={formatTime(activity.moving_time)}
									unitOfMeasurement={unitOfMeasurement}
								/>

								<DetailsTableRow
									label="Average HR"
									value={activity.average_heartrate?.toFixed(0)}
									type="heartrate"
									unitOfMeasurement={unitOfMeasurement}
								/>
								<DetailsTableRow
									label="Average Pace"
									value={formatPace(activity.average_speed, unitOfMeasurement)}
									type="pace"
									unitOfMeasurement={unitOfMeasurement}
								/>

								<DetailsTableRow
									unitOfMeasurement={unitOfMeasurement}
									label="Gear"
									value={activity.gear?.name || "No gear"}
								/>
							</TableBody>
						</Table>
					</div>

					{!isMobile && (
						<div className="bg-muted/50 rounded-xl order-3 lg:order-3">
							<h2 className="p-2">Route Preview</h2>
							<ClientOnly fallback={<ChartLoader />}>
								<ActivityMap encodedPolyline={polyline || ""} />
							</ClientOnly>
						</div>
					)}
				</div>
				<EditorComponent queryClient={queryClient} athlete={athlete} id={id} />
			</div>
		</div>
	);
}
//
function DetailsTableRow({
	label,
	value,
	type,
	unitOfMeasurement,
}: {
	label: string;
	value: string | number;
	type?: "heartrate" | "pace";
	unitOfMeasurement: "miles" | "kilometers";
}) {
	if (!value) return null;

	const suffix = !type
		? ""
		: type === "heartrate"
			? " bpm"
			: ` min/${unitOfMeasurement === "miles" ? "mi" : "km"}`;
	return (
		<TableRow>
			<TableCell className="py-2 font-medium">{label}</TableCell>
			<TableCell className="py-2 whitespace-normal wrap-break-word">
				{`${value} ${suffix}`}
			</TableCell>
		</TableRow>
	);
}

import polyline from "@mapbox/polyline";
import { useEffect, useState } from "react";

function FitBounds({
	positions,
	useMap,
}: {
	positions: [number, number][];
	useMap: () => ReturnType<typeof import("react-leaflet").useMap>;
}) {
	const map = useMap();
	useEffect(() => {
		if (positions.length) {
			map.fitBounds(positions, { padding: [20, 20] });
		}
	}, [map, positions]);
	return null;
}

export default function ActivityMap({
	encodedPolyline,
}: {
	encodedPolyline: string;
}) {
	const [leafletComponents, setLeafletComponents] = useState<{
		MapContainer: typeof import("react-leaflet").MapContainer;
		Polyline: typeof import("react-leaflet").Polyline;
		TileLayer: typeof import("react-leaflet").TileLayer;
		useMap: typeof import("react-leaflet").useMap;
	} | null>(null);

	useEffect(() => {
		// Only import Leaflet on the client side
		Promise.all([import("react-leaflet"), import("leaflet/dist/leaflet.css")])
			.then(([reactLeaflet]) => {
				setLeafletComponents({
					MapContainer: reactLeaflet.MapContainer,
					Polyline: reactLeaflet.Polyline,
					TileLayer: reactLeaflet.TileLayer,
					useMap: reactLeaflet.useMap,
				});
			})
			.catch(console.error);
	}, []);

	if (!leafletComponents) {
		return (
			<div
				style={{ height: 300, width: "100%" }}
				className="animate-pulse bg-muted rounded"
			/>
		);
	}

	const { MapContainer, Polyline, TileLayer, useMap } = leafletComponents;
	const positions = polyline.decode(encodedPolyline) as [number, number][];

	return (
		<div className="relative z-1">
			<MapContainer style={{ height: 300, width: "100%", zIndex: 1 }}>
				<TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
				<Polyline
					positions={positions}
					pathOptions={{ color: "var(--color-primary)", weight: 2 }}
				/>
				<FitBounds positions={positions} useMap={useMap} />
			</MapContainer>
		</div>
	);
}

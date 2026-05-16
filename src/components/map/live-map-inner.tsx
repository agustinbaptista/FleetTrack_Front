"use client";

import { MapContainer, TileLayer, Rectangle, Polyline } from "react-leaflet";
import { GEOFENCE_BOUNDS } from "@/lib/geofence";
import { VehicleClusterLayer, type MapMarkerPoint } from "@/components/map/vehicle-cluster-layer";
import { FitBoundsController } from "@/components/map/fit-bounds-controller";
import { HeatmapLayer } from "@/components/map/heatmap-layer";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

export type LiveMapInnerProps = {
  height: string;
  className?: string;
  markers: MapMarkerPoint[];
  showGeofence?: boolean;
  routeLatLngs?: [number, number][];
  focusVehicleId?: string | null;
  heatPoints?: [number, number][];
  showHeatmap?: boolean;
};

const defaultCenter: [number, number] = [-34.6, -58.45];

export function LiveMapInner({
  height,
  className,
  markers,
  showGeofence = true,
  routeLatLngs,
  focusVehicleId,
  heatPoints = [],
  showHeatmap = false,
}: LiveMapInnerProps) {
  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={11}
        className="h-full w-full rounded-xl [&_.leaflet-tile-pane]:opacity-90"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showGeofence && (
          <Rectangle
            bounds={GEOFENCE_BOUNDS}
            pathOptions={{
              color: "#22c55e",
              weight: 2,
              fillColor: "#22c55e",
              fillOpacity: 0.08,
            }}
          />
        )}
        {routeLatLngs && routeLatLngs.length > 1 && (
          <Polyline
            positions={routeLatLngs}
            pathOptions={{ color: "#0ea5e9", weight: 4, opacity: 0.85 }}
          />
        )}
        <VehicleClusterLayer markers={markers} />
        <FitBoundsController markers={markers} focusVehicleId={focusVehicleId} />
        <HeatmapLayer points={heatPoints} enabled={showHeatmap && heatPoints.length > 0} />
      </MapContainer>
    </div>
  );
}

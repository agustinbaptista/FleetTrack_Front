import type { Location } from "@/types/location";
import type { VehicleAlert } from "@/types/alert";

export type VehicleLocationEvent = Location;

export type VehicleAlertEvent = VehicleAlert;

export type VehicleConnectedEvent = {
  clientId: string;
  connectedAt: string;
};

export type VehicleDisconnectedSocketEvent = {
  clientId: string;
  disconnectedAt: string;
};

export type VehicleDisconnectedVehicleEvent = {
  vehicleId: string;
  disconnectedAt: string;
};

export function isVehicleDisconnectPayload(
  p: unknown,
): p is VehicleDisconnectedVehicleEvent {
  return (
    typeof p === "object" &&
    p !== null &&
    "vehicleId" in p &&
    typeof (p as VehicleDisconnectedVehicleEvent).vehicleId === "string"
  );
}

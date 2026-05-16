export type AlertType = "SPEED" | "STOPPED" | "GEOFENCE" | string;

export type VehicleAlert = {
  id: string;
  vehicleId: string;
  type: AlertType;
  message: string;
  createdAt: string;
};

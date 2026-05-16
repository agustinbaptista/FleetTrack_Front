import { httpRequest } from "@/services/httpClient";
import type { CreateVehicleBody, UpdateVehicleBody, Vehicle } from "@/types/vehicle";

export const vehicleService = {
  list() {
    return httpRequest<Vehicle[]>("/vehicles");
  },

  get(id: string) {
    return httpRequest<Vehicle>(`/vehicles/${id}`);
  },

  create(body: CreateVehicleBody) {
    return httpRequest<Vehicle>("/vehicles", { method: "POST", body });
  },

  update(id: string, body: UpdateVehicleBody) {
    return httpRequest<Vehicle>(`/vehicles/${id}`, { method: "PATCH", body });
  },

  remove(id: string) {
    return httpRequest<void>(`/vehicles/${id}`, { method: "DELETE" });
  },
};

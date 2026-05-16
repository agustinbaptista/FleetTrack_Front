export type Location = {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  fuelLevel: number;
  engineStatus: boolean;
  createdAt: string;
};

export type CreateLocationBody = {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  fuelLevel: number;
  engineStatus: boolean;
};

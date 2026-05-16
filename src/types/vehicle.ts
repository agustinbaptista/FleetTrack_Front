export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  driverName: string;
  status: string;
  createdAt: string;
};

export type CreateVehicleBody = {
  plate: string;
  model: string;
  driverName: string;
  status?: string;
};

export type UpdateVehicleBody = Partial<CreateVehicleBody>;

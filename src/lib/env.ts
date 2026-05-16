export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const wsBaseUrl =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

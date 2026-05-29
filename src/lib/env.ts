export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export const wsBaseUrl =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") ?? "";

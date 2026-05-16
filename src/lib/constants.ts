export const STORAGE_KEYS = {
  accessToken: "tracking_access_token",
} as const;

export const AUTH_COOKIE_NAME = "auth_token";

/** JWT from backend expires in 12h — mirror cookie max-age */
export const AUTH_COOKIE_MAX_AGE_SEC = 12 * 60 * 60;

/** Consider vehicle online if last location within this window */
export const ONLINE_THRESHOLD_MS = 15_000;

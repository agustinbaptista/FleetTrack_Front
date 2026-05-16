import { AUTH_COOKIE_MAX_AGE_SEC, AUTH_COOKIE_NAME } from "@/lib/constants";

export function setAuthCookieClient(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
}

export function clearAuthCookieClient(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

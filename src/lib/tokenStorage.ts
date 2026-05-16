import { AUTH_COOKIE_NAME, STORAGE_KEYS } from "@/lib/constants";

export function getBrowserAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromLs = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (fromLs) return fromLs;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  try {
    const v = decodeURIComponent(match[1]);
    if (v) localStorage.setItem(STORAGE_KEYS.accessToken, v);
    return v;
  } catch {
    return null;
  }
}

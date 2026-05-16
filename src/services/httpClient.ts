import { apiBaseUrl } from "@/lib/env";
import { getBrowserAccessToken } from "@/lib/tokenStorage";
import { ApiError, type NestErrorBody } from "@/types/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

function getAccessToken(): string | null {
  return getBrowserAccessToken();
}

function normalizeMessage(body: NestErrorBody): string {
  const m = body.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return body.error ?? "Request failed";
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = options;
  const url = path.startsWith("http") ? path : `${apiBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const h: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (auth) {
    const token = getAccessToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }

  let initBody: string | undefined;
  if (body !== undefined && method !== "GET") {
    h["Content-Type"] = "application/json";
    initBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers: h,
    body: initBody,
    credentials: "omit",
  });

  const parsed = await parseJsonSafe(res);

  if (!res.ok) {
    const nest = (typeof parsed === "object" && parsed !== null ? parsed : {}) as NestErrorBody;
    throw new ApiError(normalizeMessage(nest), res.status, parsed);
  }

  return parsed as T;
}

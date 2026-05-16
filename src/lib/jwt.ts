import { jwtDecode } from "jwt-decode";
import type { JwtClaims } from "@/types/auth";

export function decodeAccessToken(token: string): JwtClaims {
  return jwtDecode<JwtClaims>(token);
}

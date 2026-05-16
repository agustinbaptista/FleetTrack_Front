import type { Role } from "@/types/role";

export type JwtClaims = {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = {
  email: string;
  password: string;
  role?: Role;
};

export type AuthTokensResponse = {
  accessToken: string;
};

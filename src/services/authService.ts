import { httpRequest } from "@/services/httpClient";
import type { AuthTokensResponse, LoginBody, RegisterBody } from "@/types/auth";

export const authService = {
  login(body: LoginBody) {
    return httpRequest<AuthTokensResponse>("/auth/login", {
      method: "POST",
      body,
      auth: false,
    });
  },

  register(body: RegisterBody) {
    return httpRequest<AuthTokensResponse>("/auth/register", {
      method: "POST",
      body,
      auth: false,
    });
  },
};

import { apiClient } from "./client";
import { LoginFormData, ResetPasswordFormData, EmailFormData } from "../schemas/validation.schemas";

export interface LoginResponse {
  otpRequired: boolean;
  accessToken: string;
  refreshToken?: string;
}

export interface Login2FAResponse extends Omit<LoginResponse, "otpRequired"> {}

export interface Setup2FAResponse {
  qrcode: string;
  secret: string;
}

export const authApi = {
  login: async (data: LoginFormData): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data.data;
  },

  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.get("/auth/refresh-token");
    return response.data.data;
  },

  logout: async (): Promise<string> => {
    const response = await apiClient.delete("/auth/logout");
    return response.data.data;
  },

  initiate2faSetup: async (): Promise<Setup2FAResponse> => {
    const response = await apiClient.get("/auth/2fa/setup");
    return response.data.data;
  },

  confirm2faSetup: async (code: string): Promise<string> => {
    const response = await apiClient.post("/auth/2fa/setup/verify", { code });
    return response.data.data;
  },

  verify2faCode: async (code: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post("/auth/2fa/verify", { code });
    return response.data.data;
  },

  disable2fa: async (code: string): Promise<string> => {
    const response = await apiClient.post("/auth/2fa/disable", { code });
    return response.data.data;
  },

  forgotPassword: async (data: EmailFormData): Promise<string> => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response.data.data;
  },

  resetPassword: async (data: ResetPasswordFormData, token: string): Promise<string> => {
    const response = await apiClient.post(`/auth/reset-password?token=${token}`, data);
    return response.data.data;
  },
};

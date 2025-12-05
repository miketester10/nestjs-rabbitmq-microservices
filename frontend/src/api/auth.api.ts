import { apiClient } from "./client";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  otpRequired: boolean;
  accessToken: string;
  refreshToken?: string;
}

export interface Login2FAResponse extends Omit<LoginResponse, "otpRequired"> {}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OtpDto {
  code: string;
}

export interface TwoFactorSetupResponse {
  qrcode: string;
  secret: string;
}

export interface ResetPasswordDto {
  password: string;
  confirmPassword: string;
}

export interface EmailDto {
  email: string;
}

export const authApi = {
  login: async (data: LoginDto): Promise<LoginResponse> => {
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

  initiate2faSetup: async (): Promise<TwoFactorSetupResponse> => {
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

  forgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data.data;
  },

  resetPassword: async (password: string, confirmPassword: string, token: string): Promise<string> => {
    const response = await apiClient.post(`/auth/reset-password?token=${token}`, {
      password,
      confirmPassword,
    });
    return response.data.data;
  },
};

import { apiClient } from "./client";
import { RegisterFormData } from "../schemas/validation.schemas";

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  is2faEnabled: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  register: async (data: RegisterFormData): Promise<string> => {
    const response = await apiClient.post("/users/register", data);
    return response.data.data;
  },

  verifyEmail: async (token: string): Promise<string> => {
    const response = await apiClient.get(`/users/verify-email?token=${token}`);
    return response.data.data;
  },

  resendVerificationEmail: async (email: string): Promise<string> => {
    const response = await apiClient.post("/users/resend-email-verification", { email });
    return response.data.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get("/users/profile");
    return response.data.data.user;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete("/users/profile");
  },
};

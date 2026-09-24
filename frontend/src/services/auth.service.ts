import api from "./api";
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from "../types";

interface UpdateProfileInput {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
    };
}

export const authService = {
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/register", credentials);
        return response.data;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login", credentials);
        return response.data;
    },

    getMe: async (): Promise<AuthResponse> => {
        const response = await api.get<AuthResponse>("/auth/me");
        return response.data;
    },

    updateProfile: async (data: UpdateProfileInput): Promise<UpdateProfileResponse> => {
        const response = await api.put<UpdateProfileResponse>("/auth/profile", data);
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
};
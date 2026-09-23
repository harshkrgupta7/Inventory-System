import api from "./api";
import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../types";

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

    logout: (): void => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
};
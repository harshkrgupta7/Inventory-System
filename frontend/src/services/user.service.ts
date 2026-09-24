import api from "./api";
import type { User } from "../types";

export const userService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<{ success: boolean; message: string; data: { data: User[]; pagination: any } }>("/users", { params });
    return response.data;
  },
  update: async (id: number | string, data: { name?: string; email?: string; role?: "admin" | "user"; suspended?: boolean }) => {
    const response = await api.patch<{ success: boolean; message: string; data: User }>(`/users/${id}`, data);
    return response.data;
  },
};

import api from "./api";
import type { CategoryResponse, NewCategory } from "../types";

export const categoryService = {
    create: async (data: NewCategory): Promise<{ success: boolean; message: string; data: CategoryResponse }> => {
        const response = await api.post("/categories", data);
        return response.data;
    },

    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: string }): Promise<{ success: boolean; message: string; data: CategoryResponse[]; pagination: any }> => {
        const response = await api.get("/categories", { params });
        return response.data;
    },

    getById: async (id: string): Promise<{ success: boolean; message: string; data: CategoryResponse }> => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    update: async (id: string, data: Partial<NewCategory>): Promise<{ success: boolean; message: string; data: CategoryResponse }> => {
        const response = await api.patch(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};
import api from "./api";
import type { Order, OrderQueryParams, CreateOrderInput, OrderResponse } from "../types";

export const orderService = {
    create: async (data: CreateOrderInput): Promise<{ success: boolean; message: string; data: OrderResponse }> => {
        const response = await api.post("/orders", data);
        return response.data;
    },

    getAll: async (params?: OrderQueryParams): Promise<{ success: boolean; message: string; data: OrderResponse[]; pagination: any }> => {
        const response = await api.get("/orders", { params });
        return response.data;
    },

    getById: async (id: string): Promise<{ success: boolean; message: string; data: OrderResponse }> => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    update: async (id: string, data: CreateOrderInput): Promise<{ success: boolean; message: string; data: OrderResponse }> => {
        const response = await api.patch(`/orders/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ success: boolean; message: string; data?: { deleted: boolean } }> => {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: Order["status"]): Promise<{ success: boolean; message: string; data: OrderResponse }> => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },
};
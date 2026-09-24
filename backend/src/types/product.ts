import { PaginationParams } from "../types";

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stockQuantity: number;
    categoryId: string | null;
    createdBy: string;
    status: "active" | "inactive" | "out_of_stock";
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    category?: Category;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface NewProduct {
    name: string;
    description?: string;
    price: string;
    stockQuantity?: number;
    categoryId?: string;
    createdBy: string;
    status?: "active" | "inactive" | "out_of_stock";
}

export interface NewCategory {
    name: string;
    description?: string;
    createdBy: string;
    status?: "active" | "inactive";
}

export interface ProductQueryParams extends PaginationParams {
    search?: string;
    category?: string;
    inStock?: boolean;
    status?: "active" | "inactive" | "out_of_stock";
}

export interface ProductResponse {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stockQuantity: number;
    categoryId: string | null;
    createdBy: string;
    status: "active" | "inactive" | "out_of_stock";
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    category?: CategoryResponse;
}

export interface CategoryResponse {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
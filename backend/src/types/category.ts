import { PaginationParams } from "./index";

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

export interface NewCategory {
    name: string;
    description?: string;
    createdBy: string;
    status?: "active" | "inactive";
}

export interface CategoryQueryParams extends PaginationParams {
    search?: string;
    status?: "active" | "inactive";
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
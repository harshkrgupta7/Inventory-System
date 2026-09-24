import { PaginationParams } from "../types";

export const getPaginationParams = (params: PaginationParams): {
    page: number;
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
} => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const offset = (page - 1) * limit;
    const sortBy = params.sortBy || "createdAt";
    const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

    return { page, limit, offset, sortBy, sortOrder };
};

export const calculatePagination = (
    total: number,
    page: number,
    limit: number
): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
} => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

export const buildOrderByClause = (
    sortBy: string,
    sortOrder: "asc" | "desc",
    allowedFields: string[] = ["createdAt", "updatedAt", "name", "price", "stockQuantity", "totalAmount", "status"]
): string => {
    const fieldMap: Record<string, string> = {
        createdAt: "created_at",
        updatedAt: "updated_at",
        stockQuantity: "stock_quantity",
        totalAmount: "total_amount",
        name: "name",
        price: "price",
        status: "status",
    };
    const field = allowedFields.includes(sortBy) ? fieldMap[sortBy] || sortBy : "created_at";
    const order = sortOrder === "asc" ? "ASC" : "DESC";
    return `${field} ${order}`;
};
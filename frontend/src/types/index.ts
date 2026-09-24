export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    createdAt?: string;
    suspendedAt?: string | null;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
}

export interface ApiError {
    success: boolean;
    message: string;
}

// Product types
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

export interface ProductQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: boolean;
    status?: "active" | "inactive" | "out_of_stock";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
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
    createdBy?: string;
    status?: "active" | "inactive";
}

// Order types
export interface Order {
    id: string;
    userId: string;
    totalAmount: string;
    status: "pending" | "approved" | "rejected";
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: string;
    createdAt: string;
    product?: {
        id: string;
        name: string;
        price: string;
    };
}

export interface CreateOrderInput {
    items: {
        productId: number;
        quantity: number;
    }[];
}

export interface OrderQueryParams {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface OrderResponse {
    id: string;
    userId: string;
    totalAmount: string;
    status: "pending" | "approved" | "rejected";
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    items: OrderItemResponse[];
}

export interface OrderItemResponse {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: string;
    createdAt: string;
    product?: {
        id: string;
        name: string;
        price: string;
    };
}
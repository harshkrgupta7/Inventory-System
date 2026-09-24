import { PaginationParams } from "./index";

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

export interface NewOrder {
    userId: string;
    totalAmount: string;
    status?: "pending" | "approved" | "rejected";
    createdBy: string;
}

export interface NewOrderItem {
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: string;
}

export interface CreateOrderInput {
    items: {
        productId: string;
        quantity: number;
    }[];
}

export interface OrderQueryParams extends PaginationParams {
    status?: "pending" | "approved" | "rejected";
    userId?: string;
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
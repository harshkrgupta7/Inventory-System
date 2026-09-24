import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200
): void => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };
    res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
    res: Response,
    data: T[],
    pagination: {
        page: number;
        limit: number;
        total: number;
    },
    message = "Success",
    statusCode = 200
): void => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const response: PaginatedResponse<T> = {
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages,
        },
    };
    res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message = "Internal server error",
    statusCode = 500,
    error?: unknown
): void => {
    const response: ApiResponse<null> = {
        success: false,
        message,
    };
    
    if (process.env.NODE_ENV === "development" && error) {
        (response as any).error = String(error);
    }
    
    res.status(statusCode).json(response);
};

export const sendValidationError = (
    res: Response,
    message: string,
    errors: Record<string, string[]> | string[]
): void => {
    const response = {
        success: false,
        message,
        errors,
    };
    res.status(400).json(response);
};

export const sendNotFound = (
    res: Response,
    message = "Resource not found"
): void => {
    const response: ApiResponse<null> = {
        success: false,
        message,
    };
    res.status(404).json(response);
};

export const sendUnauthorized = (
    res: Response,
    message = "Unauthorized"
): void => {
    const response: ApiResponse<null> = {
        success: false,
        message,
    };
    res.status(401).json(response);
};

export const sendForbidden = (
    res: Response,
    message = "Forbidden"
): void => {
    const response: ApiResponse<null> = {
        success: false,
        message,
    };
    res.status(403).json(response);
};

export const sendConflict = (
    res: Response,
    message = "Conflict"
): void => {
    const response: ApiResponse<null> = {
        success: false,
        message,
    };
    res.status(409).json(response);
};
import { Response, NextFunction, Request } from "express";

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]> | string[];

    constructor(message: string, errors: Record<string, string[]> | string[]) {
        super(message, 400);
        this.errors = errors;
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error("Error:", err);

    if (err instanceof AppError) {
        if (err instanceof ValidationError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message,
                errors: err.errors,
            });
            return;
        }

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    if (err instanceof SyntaxError && "status" in err && (err as any).status === 400) {
        res.status(400).json({
            success: false,
            message: "Invalid JSON payload",
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
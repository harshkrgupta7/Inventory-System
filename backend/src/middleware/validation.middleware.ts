import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { sendValidationError } from "../utils/response";

type ZodSchema = ZodObject<any>;

export const validate = (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors: Record<string, string[]> = {};
                error.issues.forEach((err) => {
                    const path = err.path.join(".");
                    if (!formattedErrors[path]) {
                        formattedErrors[path] = [];
                    }
                    formattedErrors[path].push(err.message);
                });
                sendValidationError(res, "Validation failed", formattedErrors);
                return;
            }
            next(error);
        }
    };

export const validateBody = (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors: Record<string, string[]> = {};
                error.issues.forEach((err) => {
                    const path = err.path.join(".");
                    if (!formattedErrors[path]) {
                        formattedErrors[path] = [];
                    }
                    formattedErrors[path].push(err.message);
                });
                sendValidationError(res, "Validation failed", formattedErrors);
                return;
            }
            next(error);
        }
    };

export const validateQuery = (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = await schema.parseAsync(req.query);
            Object.assign(req.query, parsed);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors: Record<string, string[]> = {};
                error.issues.forEach((err) => {
                    const path = err.path.join(".");
                    if (!formattedErrors[path]) {
                        formattedErrors[path] = [];
                    }
                    formattedErrors[path].push(err.message);
                });
                sendValidationError(res, "Validation failed", formattedErrors);
                return;
            }
            next(error);
        }
    };

export const validateParams = (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = await schema.parseAsync(req.params);
            Object.assign(req.params, parsed);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors: Record<string, string[]> = {};
                error.issues.forEach((err) => {
                    const path = err.path.join(".");
                    if (!formattedErrors[path]) {
                        formattedErrors[path] = [];
                    }
                    formattedErrors[path].push(err.message);
                });
                sendValidationError(res, "Validation failed", formattedErrors);
                return;
            }
            next(error);
        }
    };
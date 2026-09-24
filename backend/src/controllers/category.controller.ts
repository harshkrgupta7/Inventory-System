import { Request, Response } from "express";
import { eq, and, ilike, desc, asc, count, isNull, sql } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../db/schema";
import { asyncHandler } from "../middleware/error.middleware";
import { sendSuccess, sendPaginated, sendNotFound, sendConflict } from "../utils/response";
import { getPaginationParams, calculatePagination, buildOrderByClause } from "../utils/pagination";
import { AuthRequest } from "../types";

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, status } = req.body;
    const createdBy = req.user!.id;

    const [existingCategory] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.name, name), isNull(categories.deletedAt)))
        .limit(1);

    if (existingCategory) {
        sendConflict(res, "Category with this name already exists");
        return;
    }

    const [newCategory] = await db
        .insert(categories)
        .values({
            name,
            description,
            createdBy,
            status: status || "active",
        })
        .returning();

    sendSuccess(res, newCategory, "Category created successfully", 201);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset, sortBy, sortOrder } = getPaginationParams(req.query);
    const { search, status } = req.query;

    const conditions = [isNull(categories.deletedAt)];

    if (search) {
        conditions.push(ilike(categories.name, `%${search}%`));
    }

    if (status) {
        conditions.push(eq(categories.status, status as "active" | "inactive"));
    }

    const orderBy = buildOrderByClause(sortBy, sortOrder, ["name", "createdAt", "updatedAt"]);

    const [categoryList, totalResult] = await Promise.all([
        db
            .select()
            .from(categories)
            .where(and(...conditions))
            .orderBy(sql.raw(orderBy))
            .limit(limit)
            .offset(offset),
        db
            .select({ count: count() })
            .from(categories)
            .where(and(...conditions)),
    ]);

    const total = totalResult[0]?.count || 0;
    const pagination = calculatePagination(total, page, limit);

    sendPaginated(res, categoryList, pagination, "Categories retrieved successfully");
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const [category] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
        .limit(1);

    if (!category) {
        sendNotFound(res, "Category not found");
        return;
    }

    sendSuccess(res, category, "Category retrieved successfully");
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { name, description, status } = req.body;

    const [existingCategory] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
        .limit(1);

    if (!existingCategory) {
        sendNotFound(res, "Category not found");
        return;
    }

    if (name && name !== existingCategory.name) {
        const [duplicate] = await db
            .select()
            .from(categories)
            .where(and(eq(categories.name, name), isNull(categories.deletedAt)))
            .limit(1);

        if (duplicate) {
            sendConflict(res, "Category with this name already exists");
            return;
        }
    }

    const updateData: Record<string, any> = {
        updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const [updatedCategory] = await db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning();

    sendSuccess(res, updatedCategory, "Category updated successfully");
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    const [existingCategory] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
        .limit(1);

    if (!existingCategory) {
        sendNotFound(res, "Category not found");
        return;
    }

    await db
        .update(categories)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(categories.id, id));

    sendSuccess(res, null, "Category deleted successfully");
});
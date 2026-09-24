import { Request, Response } from "express";
import { eq, and, ilike, desc, asc, count, isNull, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { products, categories, users } from "../db/schema";
import { asyncHandler } from "../middleware/error.middleware";
import { sendSuccess, sendPaginated, sendNotFound, sendConflict } from "../utils/response";
import { getPaginationParams, calculatePagination, buildOrderByClause } from "../utils/pagination";
import { AuthRequest } from "../types";

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, price, stockQuantity, categoryId, status } = req.body;
    const createdBy = req.user!.id;

    if (categoryId) {
        const [category] = await db
            .select()
            .from(categories)
            .where(and(eq(categories.id, Number(categoryId)), isNull(categories.deletedAt)))
            .limit(1);

        if (!category) {
            sendNotFound(res, "Category not found");
            return;
        }
    }

    const [newProduct] = await db
        .insert(products)
        .values({
            name,
            description,
            price,
            stockQuantity: stockQuantity || 0,
            categoryId,
            createdBy,
            status: status || "active",
        })
        .returning();

    sendSuccess(res, newProduct, "Product created successfully", 201);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset, sortBy, sortOrder } = getPaginationParams(req.query);
    const { search, category, inStock, status } = req.query;

    const conditions = [isNull(products.deletedAt)];

    if (search) {
        conditions.push(ilike(products.name, `%${search}%`));
    }

    if (category) {
        conditions.push(eq(products.categoryId, Number(category)));
    }

    if (inStock === "true") {
        conditions.push(sql`${products.stockQuantity} > 0`);
    }

    if (status) {
        conditions.push(eq(products.status, status as "active" | "inactive" | "out_of_stock"));
    }

    const orderBy = buildOrderByClause(sortBy, sortOrder, [
        "name", "price", "stockQuantity", "createdAt", "updatedAt"
    ]);

    const [productList, totalResult] = await Promise.all([
        db
            .select({
                id: products.id,
                name: products.name,
                description: products.description,
                price: products.price,
                stockQuantity: products.stockQuantity,
                categoryId: products.categoryId,
                createdBy: products.createdBy,
                status: products.status,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
                deletedAt: products.deletedAt,
                category: {
                    id: categories.id,
                    name: categories.name,
                },
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(...conditions))
            .orderBy(sql.raw(orderBy))
            .limit(limit)
            .offset(offset),
        db
            .select({ count: count() })
            .from(products)
            .where(and(...conditions)),
    ]);

    const total = totalResult[0]?.count || 0;
    const pagination = calculatePagination(total, page, limit);

    sendPaginated(res, productList, pagination, "Products retrieved successfully");
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const [product] = await db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            stockQuantity: products.stockQuantity,
            categoryId: products.categoryId,
            createdBy: products.createdBy,
            status: products.status,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            deletedAt: products.deletedAt,
            category: {
                id: categories.id,
                name: categories.name,
                description: categories.description,
                status: categories.status,
            },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1);

    if (!product) {
        sendNotFound(res, "Product not found");
        return;
    }

    sendSuccess(res, product, "Product retrieved successfully");
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { name, description, price, stockQuantity, categoryId, status } = req.body;

    const [existingProduct] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1);

    if (!existingProduct) {
        sendNotFound(res, "Product not found");
        return;
    }

    if (categoryId) {
        const [category] = await db
            .select()
            .from(categories)
            .where(and(eq(categories.id, Number(categoryId)), isNull(categories.deletedAt)))
            .limit(1);

        if (!category) {
            sendNotFound(res, "Category not found");
            return;
        }
    }

    const updateData: Record<string, any> = {
        updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stockQuantity !== undefined) updateData.stockQuantity = stockQuantity;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (status !== undefined) updateData.status = status;

    const [updatedProduct] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();

    sendSuccess(res, updatedProduct, "Product updated successfully");
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);

    const [existingProduct] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, id), isNull(products.deletedAt)))
        .limit(1);

    if (!existingProduct) {
        sendNotFound(res, "Product not found");
        return;
    }

    await db
        .update(products)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(products.id, id));

    sendSuccess(res, null, "Product deleted successfully");
});
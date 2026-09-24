import { Request, Response } from "express";
import { eq, and, desc, asc, count, isNull, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { orders, orderItems, products, users } from "../db/schema";
import { asyncHandler } from "../middleware/error.middleware";
import { sendSuccess, sendPaginated, sendNotFound, sendForbidden, sendError } from "../utils/response";
import { getPaginationParams, calculatePagination, buildOrderByClause } from "../utils/pagination";
import { AuthRequest } from "../types";

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body as { items: { productId: number; quantity: number }[] };
    const userId = req.user!.id;
    const createdBy = req.user!.id;
    const productIds = items.map((item) => item.productId);
    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length !== productIds.length) {
        sendForbidden(res, "Each product may appear only once in an order");
        return;
    }

    try {
        const order = await db.transaction(async (tx: any) => {
            const productList = await tx
                .select()
                .from(products)
                .where(and(inArray(products.id, uniqueProductIds), isNull(products.deletedAt)))
                .for("update");

            if (productList.length !== uniqueProductIds.length) {
                const error: any = new Error("One or more products not found");
                error.statusCode = 404;
                throw error;
            }

            let totalAmount = 0;
            const orderItemsData = items.map((item) => {
                const product = productList.find((product: { id: number }) => product.id === item.productId);
                if (product.stockQuantity < item.quantity) {
                    const error: any = new Error(`Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}`);
                    error.statusCode = 409;
                    throw error;
                }
                totalAmount += Number(product.price) * item.quantity;
                return {
                    productId: product.id,
                    quantity: item.quantity,
                    priceAtPurchase: product.price,
                };
            });

            const [newOrder] = await tx
                .insert(orders)
                .values({ userId, totalAmount: totalAmount.toFixed(2), status: "pending", createdBy })
                .returning();

            const orderItemsWithOrderId = orderItemsData.map((item) => ({ ...item, orderId: newOrder.id }));
            await tx.insert(orderItems).values(orderItemsWithOrderId);

            for (const item of orderItemsData) {
                await tx
                    .update(products)
                    .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`, updatedAt: new Date() })
                    .where(eq(products.id, item.productId));
            }

            return { ...newOrder, items: orderItemsWithOrderId };
        });

        sendSuccess(res, order, "Order created successfully", 201);
    } catch (error: any) {
        const statusCode = error.statusCode || 500;
        sendError(res, error.message || "Unable to create order", statusCode);
    }
});

export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, offset, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status } = req.query;
    const isAdmin = req.user?.role === "admin";
    const userId = isAdmin ? undefined : req.user!.id;

    const conditions = [isNull(orders.deletedAt)];

    if (!isAdmin && userId) {
        conditions.push(eq(orders.userId, userId));
    }

    if (status) {
        conditions.push(eq(orders.status, status as "pending" | "approved" | "rejected"));
    }

    const orderBy = buildOrderByClause(sortBy, sortOrder, ["createdAt", "totalAmount", "status"]);

    const [orderList, totalResult] = await Promise.all([
        db
            .select({
                id: orders.id,
                userId: orders.userId,
                totalAmount: orders.totalAmount,
                status: orders.status,
                createdBy: orders.createdBy,
                createdAt: orders.createdAt,
                updatedAt: orders.updatedAt,
                deletedAt: orders.deletedAt,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
            })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .where(and(...conditions))
            .orderBy(sql.raw(orderBy))
            .limit(limit)
            .offset(offset),
        db
            .select({ count: count() })
            .from(orders)
            .where(and(...conditions)),
    ]);

    const total = totalResult[0]?.count || 0;
    const pagination = calculatePagination(total, page, limit);

    sendPaginated(res, orderList, pagination, "Orders retrieved successfully");
});

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const isAdmin = req.user?.role === "admin";
    const userId = isAdmin ? undefined : req.user!.id;

    const conditions = [eq(orders.id, id), isNull(orders.deletedAt)];

    if (!isAdmin && userId) {
        conditions.push(eq(orders.userId, userId));
    }

    const [order] = await db
        .select({
            id: orders.id,
            userId: orders.userId,
            totalAmount: orders.totalAmount,
            status: orders.status,
            createdBy: orders.createdBy,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
            deletedAt: orders.deletedAt,
            user: {
                id: users.id,
                name: users.name,
                email: users.email,
            },
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(and(...conditions))
        .limit(1);

    if (!order) {
        sendNotFound(res, "Order not found");
        return;
    }

    const items = await db
        .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            priceAtPurchase: orderItems.priceAtPurchase,
            createdAt: orderItems.createdAt,
            product: {
                id: products.id,
                name: products.name,
                price: products.price,
            },
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, id));

    sendSuccess(res, { ...order, items }, "Order retrieved successfully");
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const [existingOrder] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, id), isNull(orders.deletedAt)))
        .limit(1);

    if (!existingOrder) {
        sendNotFound(res, "Order not found");
        return;
    }

    const validTransitions: Record<string, string[]> = {
        pending: ["approved", "rejected"],
        approved: [],
        rejected: [],
    };

    if (!validTransitions[existingOrder.status]?.includes(status)) {
        sendForbidden(res, `Cannot transition from ${existingOrder.status} to ${status}`);
        return;
    }

    const [updatedOrder] = await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();

    sendSuccess(res, updatedOrder, "Order status updated successfully");
});

export const updateOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { items } = req.body as { items: { productId: number; quantity: number }[] };
    const isAdmin = req.user?.role === "admin";

    try {
        const updated = await db.transaction(async (tx: any) => {
            const [order] = await tx.select().from(orders).where(and(eq(orders.id, id), isNull(orders.deletedAt))).limit(1);
            if (!order || (!isAdmin && order.userId !== req.user!.id)) {
                const error: any = new Error("Order not found"); error.statusCode = 404; throw error;
            }
            if (order.status !== "pending") {
                const error: any = new Error("Only pending orders can be edited"); error.statusCode = 409; throw error;
            }
            const productIds = [...new Set(items.map((item) => item.productId))];
            if (productIds.length !== items.length) {
                const error: any = new Error("Each product may appear only once in an order"); error.statusCode = 409; throw error;
            }
            const oldItems = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
            for (const oldItem of oldItems) {
                await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${oldItem.quantity}` }).where(eq(products.id, oldItem.productId));
            }
            const productList = await tx.select().from(products).where(and(inArray(products.id, productIds), isNull(products.deletedAt))).for("update");
            if (productList.length !== productIds.length) {
                const error: any = new Error("One or more products not found"); error.statusCode = 404; throw error;
            }
            let total = 0;
            const nextItems = items.map((item) => {
                const product = productList.find((entry: { id: number }) => entry.id === item.productId);
                if (product.stockQuantity < item.quantity) {
                    const error: any = new Error(`Insufficient stock for ${product.name}`); error.statusCode = 409; throw error;
                }
                total += Number(product.price) * item.quantity;
                return { orderId: id, productId: product.id, quantity: item.quantity, priceAtPurchase: product.price };
            });
            await tx.delete(orderItems).where(eq(orderItems.orderId, id));
            await tx.insert(orderItems).values(nextItems);
            for (const item of nextItems) {
                await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` }).where(eq(products.id, item.productId));
            }
            const [result] = await tx.update(orders).set({ totalAmount: total.toFixed(2), updatedAt: new Date() }).where(eq(orders.id, id)).returning();
            return { ...result, items: nextItems };
        });
        sendSuccess(res, updated, "Order updated successfully");
    } catch (error: any) {
        sendError(res, error.message || "Unable to update order", error.statusCode || 500);
    }
});

export const deleteOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const isAdmin = req.user?.role === "admin";
    try {
        const deleted = await db.transaction(async (tx: any) => {
            const [order] = await tx.select().from(orders).where(and(eq(orders.id, id), isNull(orders.deletedAt))).limit(1);
            if (!order || (!isAdmin && order.userId !== req.user!.id)) {
                const error: any = new Error("Order not found"); error.statusCode = 404; throw error;
            }
            if (["approved", "rejected"].includes(order.status)) {
                const error: any = new Error("This order cannot be deleted"); error.statusCode = 409; throw error;
            }
            const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
            for (const item of items) {
                await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}` }).where(eq(products.id, item.productId));
            }
            await tx.update(orders).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, id));
            return true;
        });
        sendSuccess(res, { deleted }, "Order deleted and stock restored");
    } catch (error: any) {
        sendError(res, error.message || "Unable to delete order", error.statusCode || 500);
    }
});
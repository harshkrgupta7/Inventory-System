import { Request, Response } from "express";
import { eq, and, count, sum, sql, isNull, desc, gte } from "drizzle-orm";
import { db } from "../db";
import { users, products, orders, orderItems } from "../db/schema";
import { asyncHandler } from "../middleware/error.middleware";
import { sendSuccess } from "../utils/response";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        totalUsersResult,
        activeUsersResult,
        totalProductsResult,
        totalOrdersResult,
        totalRevenueResult,
        recentOrdersResult,
        lowStockProductsResult,
    ] = await Promise.all([
        db.select({ count: count() }).from(users).where(isNull(users.deletedAt)),
        db.select({ count: count() }).from(users).where(and(isNull(users.deletedAt), gte(users.createdAt, thirtyDaysAgo))),
        db.select({ count: count() }).from(products).where(and(isNull(products.deletedAt), eq(products.status, "active"))),
        db.select({ count: count() }).from(orders).where(isNull(orders.deletedAt)),
        db.select({ total: sum(orders.totalAmount) }).from(orders).where(and(isNull(orders.deletedAt), eq(orders.status, "approved"))),
        db
            .select({
                id: orders.id,
                userId: orders.userId,
                totalAmount: orders.totalAmount,
                status: orders.status,
                createdAt: orders.createdAt,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
            })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .where(isNull(orders.deletedAt))
            .orderBy(desc(orders.createdAt))
            .limit(5),
        db
            .select({
                id: products.id,
                name: products.name,
                stockQuantity: products.stockQuantity,
                price: products.price,
            })
            .from(products)
            .where(and(isNull(products.deletedAt), sql`${products.stockQuantity} <= 10`))
            .orderBy(products.stockQuantity)
            .limit(10),
    ]);

    const stats = {
        totalUsers: totalUsersResult[0]?.count || 0,
        activeUsers: activeUsersResult[0]?.count || 0,
        totalProducts: totalProductsResult[0]?.count || 0,
        totalOrders: totalOrdersResult[0]?.count || 0,
        totalRevenue: parseFloat(totalRevenueResult[0]?.total || "0"),
        recentOrders: recentOrdersResult,
        lowStockProducts: lowStockProductsResult,
    };

    sendSuccess(res, stats, "Stats retrieved successfully");
});
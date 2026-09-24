import { Request, Response } from "express";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { asyncHandler } from "../middleware/error.middleware";
import { sendError, sendNotFound, sendSuccess } from "../utils/response";
import { getPaginationParams, calculatePagination, buildOrderByClause } from "../utils/pagination";
import { AuthRequest } from "../types";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, offset, sortBy, sortOrder } = getPaginationParams(req.query);
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const conditions = [isNull(users.deletedAt)];
  if (search) conditions.push(sql`${users.name} ILIKE ${`%${search}%`}`);

  const order = buildOrderByClause(sortBy, sortOrder, ["name", "email", "role", "createdAt"]);
  const [rows, totalResult] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, suspendedAt: users.suspendedAt })
      .from(users).where(and(...conditions)).orderBy(sql.raw(order)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(users).where(and(...conditions)),
  ]);

  sendSuccess(res, { data: rows, pagination: calculatePagination(Number(totalResult[0]?.count || 0), page, limit) }, "Users retrieved successfully");
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { name, email, role, suspended } = req.body as { name?: string; email?: string; role?: "admin" | "user"; suspended?: boolean };
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin && req.user?.id !== id) { sendError(res, "You can only edit your own account", 403); return; }

  const [target] = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt))).limit(1);
  if (!target) { sendNotFound(res, "User not found"); return; }
  if (!isAdmin && suspended !== undefined) { sendError(res, "Only admins can change account suspension", 403); return; }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (role !== undefined) update.role = role;
  if (suspended !== undefined) update.suspendedAt = suspended ? new Date() : null;

  const [updated] = await db.update(users).set(update).where(eq(users.id, id)).returning({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, suspendedAt: users.suspendedAt });
  sendSuccess(res, updated, "User updated successfully");
});

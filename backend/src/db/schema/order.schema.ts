import { pgTable, decimal, integer, timestamp, pgEnum, serial, index } from "drizzle-orm/pg-core";
import { products } from "./product.schema";

export const orderEnum = pgEnum("order_status", ["pending", "approved", "rejected"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderEnum("status").default("pending").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("orders_user_id_idx").on(table.userId),
  index("orders_status_idx").on(table.status),
  index("orders_created_at_idx").on(table.createdAt),
]);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: serial("order_id").references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
  productId: serial("product_id").references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
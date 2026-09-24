import { pgTable, varchar, text, decimal, integer, timestamp, pgEnum, serial, index } from "drizzle-orm/pg-core";
import { categories } from "./category.schema";

export const productEnum = pgEnum("product_status", ["active", "inactive", "out_of_stock"]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null", onUpdate: "cascade" }),
  createdBy: integer("created_by").notNull(),
  status: productEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("products_name_idx").on(table.name),
  index("products_category_id_idx").on(table.categoryId),
  index("products_stock_quantity_idx").on(table.stockQuantity),
  index("products_status_idx").on(table.status),
  index("products_created_at_idx").on(table.createdAt),
]);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
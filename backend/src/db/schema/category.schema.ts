import { pgTable, varchar, text, timestamp, pgEnum, serial, integer, index } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category_status", ["active", "inactive"]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  status: categoryEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("categories_name_idx").on(table.name),
  index("categories_status_idx").on(table.status),
]);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import * as userSchema from "./schema/user.schema";
import * as categorySchema from "./schema/category.schema";
import * as productSchema from "./schema/product.schema";
import * as orderSchema from "./schema/order.schema";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect(async (err, client, release) => {
    if (err || !client) {
        console.error("PostgreSQL Connection Error:", err?.message || "No database client available");
        release();
        process.exit(1);
    }

    try {
        await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
        await client.query("CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING gin (name gin_trgm_ops)");
        console.log("PostgreSQL Connected Successfully!");
    } catch (queryError) {
        console.error("PostgreSQL Index Setup Error:", queryError);
    } finally {
        release();
    }
});

export const db = drizzle(pool, {
    schema: {
        ...userSchema,
        ...categorySchema,
        ...productSchema,
        ...orderSchema,
    },
});

export default db;
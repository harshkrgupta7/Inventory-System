import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import * as userSchema from "./schema/user.schema";

dotenv.config();

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ PostgreSQL Connection Error:", err.message);
        process.exit(1);
    }
    console.log("✅ PostgreSQL Connected Successfully!");
    release();
});

// Create drizzle instance with all schemas
export const db = drizzle(pool, {
    schema: {
        ...userSchema,
    },
});

export default db;
export default {
    schema: "./src/db/schema",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: "postgresql://postgres:postgres@localhost:5432/inventory_db",
    },
    verbose: true,
    strict: true,
};
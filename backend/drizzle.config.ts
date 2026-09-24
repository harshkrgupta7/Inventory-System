export default {
    schema: "./src/db/schema",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgresql://postgres:postgres@localhost:5432/inventory_db",
    },
    verbose: true,
    strict: true,
};
# Inventory Manager

A full-stack inventory and order management system for managing products, categories, users, stock, and orders.

## Features

- JWT authentication with register, login, profile editing, and password hashing
- Product and category CRUD with search, filters, pagination, and soft deletes
- Dynamic category selection when creating or editing products
- Authenticated order creation with stock validation and transactional updates
- Order editing, deletion, stock restoration, and status management
- Order statuses: `pending`, `approved`, and `rejected`
- User management with role changes and account suspension
- Dashboard statistics for products, categories, orders, and low-stock items
- Responsive dark UI with AG Grid data tables and black, white, and orange styling

## Tech Stack

### Frontend

- **React** — Component-based UI for authentication, dashboard, products, categories, orders, users, settings, and profile pages.
- **TypeScript** — Strongly typed components, services, API models, and application state.
- **Vite** — Fast development server and optimized production bundler.
- **React Router** — Client-side routing and protected application pages.
- **Axios** — API requests, JWT authorization headers, and response interceptors.
- **Tailwind CSS v4** — Utility-first black, white, and orange interface styling.
- **AG Grid React** — Sortable, filterable, paginated data tables.
- **Lucide React** — Icons for navigation and user actions.

### Backend

- **Node.js** — JavaScript runtime for the API server.
- **Express** — REST API routing, middleware, validation, and error handling.
- **TypeScript** — Typed controllers, schemas, services, and request handling.
- **PostgreSQL** — Relational database for users, categories, products, orders, and order items.
- **Drizzle ORM** — Type-safe SQL queries and database schema definitions.
- **Drizzle Kit** — Database schema migrations and synchronization.
- **Zod** — Validation for request bodies, query parameters, and IDs.
- **JWT** — Stateless authentication and authorization tokens.
- **bcryptjs** — Secure password hashing.
- **express-rate-limit** — API request protection.
- **CORS** — Controlled communication between the frontend and backend.
- **pg** — PostgreSQL driver and connection pooling.

### Database and Performance

- Numeric auto-increment IDs and foreign-key relationships.
- Soft deletes using `deleted_at` timestamps.
- Indexes for product names, categories, stock, status, dates, users, and orders.
- PostgreSQL `pg_trgm` GIN index for fast partial product-name searches.
- Database transactions and row locks for safe concurrent stock updates.

## Project Structure

```text
frontend/   React application
backend/    Express API, database schemas, migrations, and Postman collection
```

## Run Locally

```powershell
cd backend
pnpm install
pnpm db:push
pnpm dev
```

In another terminal:

```powershell
cd frontend
pnpm install
pnpm dev
```

Import `backend/postman/Inventory_API.postman_collection.json` into Postman to test the APIs.

## Imagine two users try to buy the last available item at the same time. How would you make sure the stock does not become negative or both orders get confirmed?

The Problem is called Concurrent Order Problem  : 

To prevent overselling when two users try to buy the last item at the same time, the stock update and order creation should be handled inside a database transaction with a row lock. The first transaction successfully reserves the item and decreases the stock. The second transaction sees that no stock is available and the order is rejected. This ensures stock never becomes negative and both orders cannot be confirmed for the same item.

### Queue alternative

A future alternative is to process stock reservations through a queue. Orders would be handled sequentially, and each request would check current stock and reduce it only when available. Requests for unavailable stock would be rejected.

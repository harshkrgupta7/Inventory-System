import express, { Application, Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import statsRoutes from "./routes/stats.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ========== Rate Limiting ==========
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"),
    max: parseInt(process.env.RATE_LIMIT_MAX || "1000"),
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// ========== Middlewares ==========
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5174",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== Health Check ==========
app.get("/", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "🚀 Inventory API is running!",
        version: "1.0.0",
    });
});

// ========== Routes ==========
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);

// ========== Error Handler ==========
app.use(errorHandler);

// ========== 404 Handler ==========
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ========== Start Server ==========
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV}`);
});

export default app;
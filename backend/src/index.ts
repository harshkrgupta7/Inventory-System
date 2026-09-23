import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

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
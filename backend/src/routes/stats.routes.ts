import { Router } from "express";
import { getStats } from "../controllers/stats.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get(
    "/",
    protect,
    authorize("admin"),
    getStats
);

export default router;
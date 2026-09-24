import { Router } from "express";
import { getUsers, updateUser } from "../controllers/user.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validateBody, validateParams } from "../middleware/validation.middleware";
import { idParamSchema, updateUserSchema } from "../utils/validation";

const router = Router();
router.get("/", protect, getUsers);
router.patch("/:id", protect, validateParams(idParamSchema), validateBody(updateUserSchema), updateUser);
export default router;

import { Router } from "express";
import {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation.middleware";
import {
    createCategorySchema,
    updateCategorySchema,
    categoryQuerySchema,
    idParamSchema,
} from "../utils/validation";

const router = Router();

router.post(
    "/",
    protect,
    validateBody(createCategorySchema),
    createCategory
);

router.get(
    "/",
    validateQuery(categoryQuerySchema),
    getCategories
);

router.get(
    "/:id",
    validateParams(idParamSchema),
    getCategory
);

router.patch(
    "/:id",
    protect,
    validateParams(idParamSchema),
    validateBody(updateCategorySchema),
    updateCategory
);

router.delete(
    "/:id",
    protect,
    validateParams(idParamSchema),
    deleteCategory
);

export default router;
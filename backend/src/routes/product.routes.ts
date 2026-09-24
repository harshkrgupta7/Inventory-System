import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation.middleware";
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
    idParamSchema,
} from "../utils/validation";

const router = Router();

router.post(
    "/",
    protect,
    validateBody(createProductSchema),
    createProduct
);

router.get(
    "/",
    validateQuery(productQuerySchema),
    getProducts
);

router.get(
    "/:id",
    validateParams(idParamSchema),
    getProduct
);

router.patch(
    "/:id",
    protect,
    validateParams(idParamSchema),
    validateBody(updateProductSchema),
    updateProduct
);

router.delete(
    "/:id",
    protect,
    validateParams(idParamSchema),
    deleteProduct
);

export default router;
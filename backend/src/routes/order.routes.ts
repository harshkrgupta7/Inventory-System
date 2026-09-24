import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
} from "../controllers/order.controller";
import { protect } from "../middleware/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation.middleware";
import {
    createOrderSchema,
    orderQuerySchema,
    idParamSchema,
    updateOrderStatusSchema,
    updateOrderSchema,
} from "../utils/validation";

const router = Router();

router.post(
    "/",
    protect,
    validateBody(createOrderSchema),
    createOrder
);

router.get(
    "/",
    protect,
    validateQuery(orderQuerySchema),
    getOrders
);

router.get(
    "/:id",
    protect,
    validateParams(idParamSchema),
    getOrder
);

router.patch(
    "/:id",
    protect,
    validateParams(idParamSchema),
    validateBody(updateOrderSchema),
    updateOrder
);

router.delete(
    "/:id",
    protect,
    validateParams(idParamSchema),
    deleteOrder
);

router.patch(
    "/:id/status",
    protect,
    validateParams(idParamSchema),
    validateBody(updateOrderStatusSchema),
    updateOrderStatus
);

export default router;
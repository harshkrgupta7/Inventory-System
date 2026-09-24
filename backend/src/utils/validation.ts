import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, "Product name is required").max(255),
    description: z.string().optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
    stockQuantity: z.number().int().min(0).optional().default(0),
    categoryId: z.coerce.number().int().positive("Invalid category ID").optional(),
    status: z.enum(["active", "inactive", "out_of_stock"]).optional().default("active"),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    category: z.coerce.number().int().positive("Invalid category ID").optional(),
    inStock: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
    status: z.enum(["active", "inactive", "out_of_stock"]).optional(),
    sortBy: z.enum(["name", "price", "stockQuantity", "createdAt", "updatedAt"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(100),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.coerce.number().int().positive("Invalid product ID"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
    })).min(1, "At least one item is required"),
});

export const updateOrderSchema = createOrderSchema;

export const updateOrderStatusSchema = z.object({
    status: z.enum(["pending", "approved", "rejected"]),
});

export const orderQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    sortBy: z.enum(["createdAt", "totalAmount", "status"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50).optional(),
    email: z.string().email("Invalid email format").optional(),
    role: z.enum(["admin", "user"]).optional(),
    suspended: z.boolean().optional(),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "user"]).optional().default("user"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50).optional(),
    email: z.string().email("Invalid email format").optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
}).refine((data) => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Current password is required when changing password",
    path: ["currentPassword"],
});

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive("Invalid ID format"),
});
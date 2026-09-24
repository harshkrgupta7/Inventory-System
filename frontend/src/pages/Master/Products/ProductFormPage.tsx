import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { productService } from "../../../services/product.service";
import { categoryService } from "../../../services/category.service";
import { Button, Input, Select } from "../../../components/ui";

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stockQuantity: string;
    categoryId: string;
    status: "active" | "inactive" | "out_of_stock";
}

interface Category {
    id: string;
    name: string;
}

export default function ProductFormPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: "",
        stockQuantity: "0",
        categoryId: "",
        status: "active",
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<ProductFormData>>({});
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll({ limit: 100 });
            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchProduct = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await productService.getById(id);
            const product = response.data;
            setFormData({
                name: product.name,
                description: product.description || "",
                price: product.price,
                stockQuantity: String(product.stockQuantity),
                categoryId: product.categoryId || "",
                status: product.status,
            });
        } catch (error) {
            console.error("Failed to fetch product:", error);
            setMessage({ type: "error", text: "Failed to load product" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchProduct();
        } else {
            setLoading(false);
        }
    }, [id]);

    const validate = () => {
        const newErrors: Partial<ProductFormData> = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.price || parseFloat(formData.price) < 0) newErrors.price = "Valid price is required";
        if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) newErrors.stockQuantity = "Valid stock quantity is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof ProductFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                price: formData.price,
                stockQuantity: parseInt(formData.stockQuantity),
                categoryId: formData.categoryId || undefined,
                status: formData.status,
                createdBy: user?.id || "",
            };

            if (isEditing) {
                await productService.update(id!, payload);
                setMessage({ type: "success", text: "Product updated successfully!" });
            } else {
                await productService.create(payload);
                setMessage({ type: "success", text: "Product created successfully!" });
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    stockQuantity: "0",
                    categoryId: "",
                    status: "active",
                });
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to save product" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="inline-flex items-center gap-3 text-amber-500">
                    <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-lg">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Product" : "Add Product"}</h1>
                    <p className="text-gray-400 mt-1">{isEditing ? "Update product details" : "Create a new product"}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate("/master/products")}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to List
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        error={errors.name}
                        required
                    />
                    <Select
                        label="Category"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "Select Category" },
                            ...categories.map((c) => ({ value: c.id, label: c.name })),
                        ]}
                        placeholder="Select Category"
                        error={errors.categoryId}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter product description (optional)"
                        rows={4}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Input
                        label="Price ($)"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        error={errors.price}
                        required
                    />
                    <Input
                        label="Stock Quantity"
                        name="stockQuantity"
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        placeholder="0"
                        error={errors.stockQuantity}
                        required
                    />
                    <Select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        options={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                            { value: "out_of_stock", label: "Out of Stock" },
                        ]}
                        placeholder="Select Status"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                    <Button variant="secondary" onClick={() => navigate("/master/products")}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                        {isEditing ? "Update Product" : "Create Product"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
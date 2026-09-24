import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../../services/product.service";
import { categoryService } from "../../../services/category.service";
import { DataTable } from "../../../components/common";
import { Button, Input, Select } from "../../../components/ui";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stockQuantity: number;
    categoryId: string | null;
    status: string;
    createdAt: string;
    category?: { id: string; name: string };
}

interface Category {
    id: string;
    name: string;
}

export default function ProductsListPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        inStock: false,
        status: "" as "" | "active" | "inactive" | "out_of_stock",
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "createdAt", direction: "desc" });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search || undefined,
                category: filters.category || undefined,
                inStock: filters.inStock || undefined,
                status: filters.status || undefined,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            };
            const response = await productService.getAll(params);
            setProducts(response.data || []);
            setPagination((prev) => ({ ...prev, total: response.pagination?.total || 0 }));
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll({ limit: 100 });
            setCategories(response.data || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [pagination.page, filters, sortConfig]);

    const handleFilterChange = (key: string, value: string | boolean) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: "bg-green-500/20 text-green-400 border-green-500/30",
            inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            out_of_stock: "bg-red-500/20 text-red-400 border-red-500/30",
        };
        return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
    };

    const handleEdit = (id: string) => {
        navigate(`/master/products/${id}/edit`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await productService.delete(id);
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Failed to delete product");
        }
    };

    const handleAddProduct = () => {
        navigate("/master/products/new");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="text-gray-400 mt-1">Manage your product inventory</p>
                </div>
                <Button onClick={handleAddProduct}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </Button>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <Input
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="sm:col-span-2"
                    />
                    <Select
                        options={[
                            { value: "", label: "All Categories" },
                            ...categories.map((c) => ({ value: c.id, label: c.name })),
                        ]}
                        value={filters.category}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        placeholder="Filter by Category"
                    />
                    <Select
                        options={[
                            { value: "", label: "All Status" },
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                            { value: "out_of_stock", label: "Out of Stock" },
                        ]}
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        placeholder="Filter by Status"
                    />
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.inStock}
                            onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                            className="w-4 h-4 text-amber-500 border-gray-600 rounded focus:ring-amber-500"
                        />
                        In Stock Only
                    </label>
                    <Select
                        options={[
                            { value: "createdAt", label: "Created Date" },
                            { value: "name", label: "Name" },
                            { value: "price", label: "Price" },
                            { value: "stockQuantity", label: "Stock" },
                        ]}
                        value={sortConfig.key}
                        onChange={(e) => setSortConfig((prev) => ({ ...prev, key: e.target.value }))}
                        placeholder="Sort By"
                        className="w-40"
                    />
                    <Select
                        options={[
                            { value: "desc", label: "Descending" },
                            { value: "asc", label: "Ascending" },
                        ]}
                        value={sortConfig.direction}
                        onChange={(e) => setSortConfig((prev) => ({ ...prev, direction: e.target.value as "asc" | "desc" }))}
                        placeholder="Order"
                        className="w-36"
                    />
                </div>

                <DataTable
                    data={products}
                    columns={[
                        {
                            key: "name",
                            header: "Product",
                            render: (item) => (
                                <div>
                                    <p className="font-medium text-white">{item.name}</p>
                                    {item.description && <p className="text-xs text-gray-500 truncate max-w-xs">{item.description}</p>}
                                </div>
                            ),
                        },
                        {
                            key: "category?.name",
                            header: "Category",
                            render: (item) => <span className="text-gray-300">{item.category?.name || "Uncategorized"}</span>,
                        },
                        {
                            key: "price",
                            header: "Price",
                            render: (item) => <span className="font-mono text-amber-400">{formatCurrency(item.price)}</span>,
                        },
                        {
                            key: "stockQuantity",
                            header: "Stock",
                            render: (item) => (
                                <span className={item.stockQuantity <= 10 ? "font-mono text-red-400" : "font-mono text-green-400"}>
                                    {item.stockQuantity} {item.stockQuantity <= 10 && <span className="ml-1 text-xs text-red-400">⚠</span>}
                                </span>
                            ),
                        },
                        {
                            key: "status",
                            header: "Status",
                            render: (item) => (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                    {item.status.replace("_", " ")}
                                </span>
                            ),
                        },
                    ]}
                    keyExtractor={(item) => item.id}
                    loading={loading}
                    emptyMessage="No products found"
                    actions={{
                        header: "Actions",
                        render: (item) => (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item.id)} className="text-blue-400 hover:text-blue-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </Button>
                            </div>
                        ),
                    }}
                    pagination={{
                        page: pagination.page,
                        limit: pagination.limit,
                        total: pagination.total,
                        onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
                        onLimitChange: (limit) => setPagination((prev) => ({ ...prev, limit, page: 1 })),
                    }}
                />
            </div>
        </div>
    );
}

function formatCurrency(amount: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount));
}
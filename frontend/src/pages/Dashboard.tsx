import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { productService } from "../services/product.service";
import { orderService } from "../services/order.service";
import { categoryService } from "../services/category.service";
import { StatCard } from "../components/common";
import { Button } from "../components/ui";

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        lowStockProducts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        setError(null);

        const [productsResult, categoriesResult, ordersResult] = await Promise.allSettled([
            productService.getAll({ limit: 1000 }),
            categoryService.getAll({ limit: 100 }),
            orderService.getAll({ limit: 1000 }),
        ]);

        const products = productsResult.status === "fulfilled" ? productsResult.value.data || [] : [];
        const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value.data || [] : [];
        const orders = ordersResult.status === "fulfilled" ? ordersResult.value.data || [] : [];
        const failed = [productsResult, categoriesResult, ordersResult].filter((result) => result.status === "rejected").length;

        if (failed > 0) {
            setError(`${failed} dashboard request${failed > 1 ? "s" : ""} could not be loaded.`);
        }

        setStats({
            totalProducts: products.length,
            totalCategories: categories.length,
            totalOrders: orders.length,
            lowStockProducts: products.filter((product) => product.stockQuantity <= 10).length,
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="inline-flex items-center gap-3 text-amber-500">
                    <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-lg">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Welcome back, {user?.name}! Here&apos;s what&apos;s happening.</p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {error} Check that the backend and database are running.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                    className="group relative cursor-pointer rounded-2xl border border-amber-600/30 bg-gray-900/50 p-6 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1"
                    onClick={() => handleNavigate("/master/products")}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-400 uppercase tracking-wide">Products</p>
                            <p className="text-4xl font-bold text-white mt-2">{stats.totalProducts.toLocaleString()}</p>
                            <p className="text-gray-400 mt-1">Total Products</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-600/20 text-amber-400 group-hover:bg-amber-600/30 group-hover:text-amber-300 transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                            View Products →
                        </Button>
                    </div>
                </div>

                <div
                    className="group relative cursor-pointer rounded-2xl border border-green-600/30 bg-gray-900/50 p-6 shadow-xl hover:shadow-2xl hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1"
                    onClick={() => handleNavigate("/orders")}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-400 uppercase tracking-wide">Orders</p>
                            <p className="text-4xl font-bold text-white mt-2">{stats.totalOrders.toLocaleString()}</p>
                            <p className="text-gray-400 mt-1">Total Orders</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-600/20 text-green-400 group-hover:bg-green-600/30 group-hover:text-green-300 transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4m0 0l-4 4m0 0h12m-4-4v12a2 2 0 002 2h10a2 2 0 002-2v-6m-4-4l4-4" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                            View Orders →
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                    title="Categories"
                    value={stats.totalCategories}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    color="blue"
                />
                <StatCard
                    title="Low Stock Alert"
                    value={stats.lowStockProducts}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    color="red"
                />
            </div>
        </div>
    );
}
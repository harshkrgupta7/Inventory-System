import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { orderService } from "../../services/order.service";
import { Button } from "../../components/ui";

type OrderStatus = "pending" | "approved" | "rejected";

interface Order {
    id: string;
    userId: string;
    totalAmount: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    user?: { id: string; name: string; email: string };
    items?: Array<{
        id: string;
        productId: string;
        quantity: number;
        priceAtPurchase: string;
        product?: { id: string; name: string; price: string };
    }>;
}

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["approved", "rejected"],
    approved: [],
    rejected: [],
};

export default function OrderViewPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fetchOrder = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await orderService.getById(id);
            setOrder(response.data);
        } catch (error) {
            console.error("Failed to fetch order:", error);
            setMessage({ type: "error", text: "Failed to load order" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount));
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            approved: "bg-green-500/20 text-green-400 border-green-500/30",
            rejected: "bg-red-500/20 text-red-400 border-red-500/30",
        };
        return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
    };

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        if (!order) return;
        setUpdating(true);
        setMessage(null);
        try {
            await orderService.updateStatus(order.id, newStatus);
            setMessage({ type: "success", text: `Order status updated to ${newStatus}` });
            fetchOrder();
        } catch (error) {
            console.error("Failed to update order status:", error);
            setMessage({ type: "error", text: "Failed to update order status" });
        } finally {
            setUpdating(false);
        }
    };

    const handleBack = () => {
        navigate("/orders");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="inline-flex items-center gap-3 text-amber-500">
                    <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-lg">Loading order...</span>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">Order not found</p>
                <Button variant="secondary" onClick={handleBack} className="mt-4">Back to Orders</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Order Details</h1>
                    <p className="text-gray-400 mt-1">Order #{String(order.id).slice(0, 8)}</p>
                </div>
                <Button variant="ghost" onClick={handleBack}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Orders
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Qty</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Unit Price</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {order.items?.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-800/50">
                                            <td className="px-4 py-3">
                                                <p className="text-white">{item.product?.name || "Unknown Product"}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{item.quantity}</td>
                                            <td className="px-4 py-3 text-amber-400 font-mono">{formatCurrency(item.priceAtPurchase)}</td>
                                            <td className="px-4 py-3 text-white font-medium">{formatCurrency((parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-700">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300" colSpan={3}>Total</th>
                                        <th className="px-4 py-3 text-left text-xl font-bold text-amber-400">{formatCurrency(order.totalAmount)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-400 text-sm">Name</p>
                                <p className="text-white font-medium">{order.user?.name || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="text-white font-medium">{order.user?.email || "Unknown"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Order ID</span>
                                <span className="font-mono text-white">{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Status</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Order Date</span>
                                <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Last Updated</span>
                                <span className="text-white">{new Date(order.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-800 pt-3">
                                <span className="text-gray-400">Total Amount</span>
                                <span className="text-xl font-bold text-amber-400">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {order.status === "pending" && (
                        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Update Status</h2>
                            <p className="text-gray-400 text-sm mb-4">Current: <span className="font-medium text-white capitalize">{order.status}</span></p>
                            <p className="text-gray-500 text-sm mb-4">
                                Allowed transitions: {validTransitions[order.status]?.join(", ") || "None (final state)"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {validTransitions[order.status]?.map((status) => (
                                    <Button
                                        key={status}
                                        variant="secondary"
                                        onClick={() => handleStatusUpdate(status)}
                                        disabled={updating}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Button>
                                ))}
                                {validTransitions[order.status]?.length === 0 && (
                                    <span className="text-gray-500 text-sm">No further transitions available</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
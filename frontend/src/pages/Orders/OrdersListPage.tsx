import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { orderService } from "../../services/order.service";
import OrderStatusModal from "../../components/common/OrderStatusModal";
import { DataTable } from "../../components/common";
import { Button, Input, Select } from "../../components/ui";

type OrderStatus = "pending" | "approved" | "rejected";

interface Order {
    id: string;
    userId: string;
    totalAmount: string;
    status: OrderStatus;
    createdAt: string;
    user?: { id: string; name: string; email: string };
    items?: Array<{ id: string; productId: string; quantity: number; priceAtPurchase: string }>;
}

export default function OrdersListPage() {
    const [statusOrder, setStatusOrder] = useState<Order | null>(null);
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [filters, setFilters] = useState({
        search: "",
        status: "" as "" | OrderStatus,
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "createdAt", direction: "desc" });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status || undefined,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
            };
            const response = await orderService.getAll(params);
            setOrders(response.data || []);
            setPagination((prev) => ({ ...prev, total: response.pagination?.total || 0 }));
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, filters, sortConfig]);

    const handleFilterChange = (key: string, value: "" | "pending" | "approved" | "rejected") => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            approved: "bg-green-500/20 text-green-400 border-green-500/30",
            rejected: "bg-red-500/20 text-red-400 border-red-500/30",
        };
        return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
    };

    const handleView = (id: string) => {
        navigate(`/orders/${id}`);
    };

    const handleEdit = (id: string) => {
        navigate(`/orders/${id}/edit`);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this order and restore product stock?")) return;
        try {
            await orderService.delete(id);
            await fetchOrders();
        } catch (error) {
            console.error("Failed to delete order:", error);
            window.alert("Unable to delete order.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Orders</h1>
                    <p className="text-gray-400 mt-1">Manage customer orders</p>
                </div>
                <Button onClick={() => navigate("/orders/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Order
                </Button>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <Input
                        placeholder="Search orders..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value as "" | OrderStatus)}
                        className="sm:col-span-2"
                    />
                    <Select
                        options={[
                            { value: "", label: "All Status" },
                            { value: "pending", label: "Pending" },
                            { value: "approved", label: "Approved" },
                            { value: "rejected", label: "Rejected" },
                        ]}
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value as "" | OrderStatus)}
                        placeholder="Filter by Status"
                    />
                    <Select
                        options={[
                            { value: "createdAt", label: "Created Date" },
                            { value: "totalAmount", label: "Amount" },
                            { value: "status", label: "Status" },
                        ]}
                        value={sortConfig.key}
                        onChange={(e) => setSortConfig((prev) => ({ ...prev, key: e.target.value }))}
                        placeholder="Sort By"
                        className="w-40"
                    />
                </div>

                <DataTable
                    data={orders}
                    columns={[
                        {
                            key: "id",
                            header: "Order ID",
                            render: (item) => <span className="font-mono text-xs text-gray-400">{String(item.id).slice(0, 8)}...</span>,
                        },
                        {
                            key: "user.name",
                            header: "Customer",
                            render: (item) => (
                                <div>
                                    <p className="font-medium text-white">{item.user?.name || "Unknown"}</p>
                                    <p className="text-xs text-gray-500">{item.user?.email || ""}</p>
                                </div>
                            ),
                        },
                        {
                            key: "totalAmount",
                            header: "Amount",
                            render: (item) => <span className="font-bold text-amber-400">{formatCurrency(item.totalAmount)}</span>,
                        },
                        {
                            key: "status",
                            header: "Status",
                            render: (item) => (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                            ),
                        },
                        {
                            key: "createdAt",
                            header: "Date",
                            render: (item) => new Date(item.createdAt).toLocaleDateString(),
                        },
                    ]}
                    keyExtractor={(item) => item.id}
                    loading={loading}
                    emptyMessage="No orders found"
                    actions={{
                        header: "Actions",
                        render: (item) => (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item.id)} disabled={item.status !== "pending"} title="Edit pending order">
                                    <Pencil className="h-4 w-4 text-blue-400" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} disabled={["approved", "rejected"].includes(item.status)} title="Delete order and restore stock">
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleView(item.id)} title="View order">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </Button>
                                 <Button variant="ghost" size="sm" onClick={() => setStatusOrder(item)} className="text-amber-400 hover:text-amber-300" disabled={item.status !== "pending"} title="Update order status">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            {statusOrder && (
                <OrderStatusModal
                    isOpen
                    orderId={statusOrder.id}
                    currentStatus={statusOrder.status}
                    onClose={() => setStatusOrder(null)}
                    onSuccess={fetchOrders}
                />
            )}
        </div>
    );
}

function formatCurrency(amount: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(amount));
}
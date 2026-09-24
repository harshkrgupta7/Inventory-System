import { useState, useEffect } from "react";
import { orderService } from "../../services/order.service";
import { Button, Select } from "../ui";

type OrderStatus = "pending" | "approved" | "rejected";

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentStatus: OrderStatus;
  onSuccess: () => void;
}

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["approved", "rejected"],
  approved: [],
  rejected: [],
};

export default function OrderStatusModal({ isOpen, onClose, orderId, currentStatus, onSuccess }: OrderStatusModalProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allowedStatuses = validTransitions[currentStatus] || [];

  useEffect(() => {
    if (isOpen) {
      setNewStatus(allowedStatuses[0] || "");
      setError(null);
    }
  }, [isOpen, currentStatus]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newStatus) return;
    setLoading(true);
    setError(null);
    try {
      await orderService.updateStatus(orderId, newStatus);
      onSuccess();
      onClose();
    } catch (submitError) {
      const axiosError = submitError as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Update Order Status</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="mb-5 text-sm text-gray-400">Current status: <span className="capitalize text-white">{currentStatus}</span></p>
          <Select
            label="New Status"
            value={newStatus}
            onChange={(event) => setNewStatus(event.target.value as OrderStatus | "")}
            options={allowedStatuses.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))}
            placeholder="Select status"
            error={error || undefined}
          />
          {!allowedStatuses.length && <p className="mt-4 text-sm text-yellow-400">This order status is final.</p>}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading} disabled={!newStatus}>Update Status</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "../../components/ui";
import { productService } from "../../services/product.service";
import { orderService } from "../../services/order.service";
import type { ProductResponse } from "../../types";

interface OrderLine {
  productId: number;
  quantity: number;
}

const OrderCreatePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [items, setItems] = useState<OrderLine[]>([{ productId: 0, quantity: 1 }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    productService.getAll({ page: 1, limit: 100, status: "active" })
      .then((response) => setProducts(response.data || []))
      .catch(() => setError("Unable to load products."))
      .finally(() => setLoading(false));
  }, []);

  const selectedLines = useMemo(() => items
    .filter((item) => item.productId)
    .map((item) => ({
      ...item,
      product: products.find((product) => Number(product.id) === item.productId),
    })), [items, products]);

  const total = selectedLines.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);

  const updateItem = (index: number, patch: Partial<OrderLine>) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const payloadItems = items.filter((item) => item.productId && item.quantity > 0);
    if (items.some((item) => item.productId && item.quantity <= 0)) {
      setError("Quantity must be greater than 0.");
      return;
    }
    if (!payloadItems.length) {
      setError("Add at least one product.");
      return;
    }
    if (selectedLines.some((item) => !item.product || item.quantity > (item.product.stockQuantity || 0))) {
      setError("One or more quantities exceed available stock.");
      return;
    }

    setSaving(true);
    try {
      await orderService.create({ items: payloadItems });
      navigate("/orders");
    } catch (submitError) {
      const axiosError = submitError as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Unable to create order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Create Order</h1>
          <p className="mt-1 text-gray-400">Select products and quantities for your order.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/orders")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-700 bg-gray-900/50 p-6">
        <div className="space-y-4">
          {loading && <p className="text-sm text-gray-400">Loading products...</p>}
          {items.map((item, index) => {
            const product = products.find((entry) => Number(entry.id) === item.productId);
            return (
              <div key={index} className="grid grid-cols-1 gap-4 rounded-xl border border-gray-800 p-4 sm:grid-cols-[1fr_140px_100px] sm:items-end">
                <Select
                  label="Product"
                  value={String(item.productId)}
                  onChange={(event) => updateItem(index, { productId: Number(event.target.value), quantity: 1 })}
                  options={[{ value: "0", label: "Select product" }, ...products.map((entry) => ({ value: String(entry.id), label: `${entry.name} (${entry.stockQuantity} available)` }))]}
                />
                <Input
                  label="Quantity"
                  type="number"
                  min={0}
                  max={product?.stockQuantity || 0}
                  value={item.quantity}
                  onChange={(event) => updateItem(index, { quantity: Math.max(0, Number(event.target.value)) })}
                />
                {item.quantity === 0 && <p className="mt-1 text-xs text-red-400 sm:col-span-3">Quantity must be greater than 0.</p>}
                <Button type="button" variant="danger" onClick={() => setItems((current) => current.length === 1 ? [{ productId: 0, quantity: 1 }] : current.filter((_, itemIndex) => itemIndex !== index))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, { productId: 0, quantity: 1 }])}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>

        <div className="flex items-center justify-between border-t border-gray-800 pt-5">
          <span className="text-gray-400">Order Total</span>
          <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
        </div>
        <Button type="submit" loading={saving} className="w-full">Place Order</Button>
      </form>
    </div>
  );
};

export default OrderCreatePage;

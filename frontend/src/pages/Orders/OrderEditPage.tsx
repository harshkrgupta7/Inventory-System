import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "../../components/ui";
import { productService } from "../../services/product.service";
import { orderService } from "../../services/order.service";
import type { ProductResponse } from "../../types";

interface Line { productId: number; quantity: number; }

const OrderEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [items, setItems] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([productService.getAll({ page: 1, limit: 100, status: "active" }), orderService.getById(id!)])
      .then(([productResponse, orderResponse]) => {
        setProducts(productResponse.data || []);
        setItems((orderResponse.data.items || []).map((item) => ({ productId: Number(item.productId), quantity: item.quantity })));
      })
      .catch(() => setError("Unable to load order."))
      .finally(() => setLoading(false));
  }, [id]);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(products.find((product) => Number(product.id) === item.productId)?.price || 0) * item.quantity, 0), [items, products]);
  const updateItem = (index: number, patch: Partial<Line>) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.some((item) => !item.productId || item.quantity <= 0)) { setError("Every order item must have a product and quantity greater than 0."); return; }
    if (new Set(items.map((item) => item.productId)).size !== items.length) { setError("Each product can appear only once."); return; }
    setSaving(true); setError("");
    try { await orderService.update(id!, { items }); navigate(`/orders/${id}`); }
    catch (submitError) { const axiosError = submitError as { response?: { data?: { message?: string } } }; setError(axiosError.response?.data?.message || "Unable to update order."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="py-16 text-center text-amber-500">Loading order...</div>;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-white">Edit Order</h1><p className="mt-1 text-gray-400">Only pending orders can be edited.</p></div><Button variant="secondary" onClick={() => navigate(`/orders/${id}`)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-700 bg-gray-900/50 p-6">
        <div className="space-y-4">{items.map((item, index) => { const product = products.find((entry) => Number(entry.id) === item.productId); return <div key={index} className="grid grid-cols-1 gap-4 rounded-xl border border-gray-800 p-4 sm:grid-cols-[1fr_140px_100px] sm:items-end"><Select label="Product" value={String(item.productId)} onChange={(event) => updateItem(index, { productId: Number(event.target.value) })} options={products.map((entry) => ({ value: String(entry.id), label: `${entry.name} (${entry.stockQuantity} available)` }))} /><Input label="Quantity" type="number" min={0} max={product?.stockQuantity || 0} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Math.max(0, Number(event.target.value)) })} />{item.quantity === 0 && <p className="text-xs text-red-400 sm:col-span-3">Quantity must be greater than 0.</p>}<Button type="button" variant="danger" onClick={() => setItems((current) => current.length === 1 ? [{ productId: 0, quantity: 1 }] : current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button></div>; })}</div>
        <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, { productId: 0, quantity: 1 }])}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        <div className="flex items-center justify-between border-t border-gray-800 pt-5"><span className="text-gray-400">Order Total</span><span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span></div>
        <Button type="submit" loading={saving} className="w-full">Update Order</Button>
      </form>
    </div>
  );
};

export default OrderEditPage;

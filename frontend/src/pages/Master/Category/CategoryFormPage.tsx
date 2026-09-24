import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Select } from "../../../components/ui";
import { categoryService } from "../../../services/category.service";

const CategoryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    status: "active" | "inactive";
  }>({
    name: "",
    description: "",
    status: "active",
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    categoryService.getById(id)
      .then((response) => {
        setFormData({
          name: response.data.name,
          description: response.data.description || "",
          status: response.data.status,
        });
      })
      .catch(() => setError("Category not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (id) {
        await categoryService.update(id, formData);
      } else {
        await categoryService.create(formData);
      }
      navigate("/master/categories");
    } catch (submitError) {
      const axiosError = submitError as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-amber-500">Loading category...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Category" : "Add Category"}</h1>
          <p className="mt-1 text-gray-400">Category information used to organize products.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/master/categories")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-700 bg-gray-900/50 p-6">
        <Input
          label="Category Name"
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          placeholder="Enter category name"
          required
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={formData.description}
            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            placeholder="Enter category description"
            rows={5}
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-white outline-none focus:border-amber-500"
          />
        </div>
        <Select
          label="Status"
          value={formData.status}
          onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as "active" | "inactive" }))}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
        <div className="flex justify-end gap-3 border-t border-gray-800 pt-5">
          <Button type="button" variant="secondary" onClick={() => navigate("/master/categories")}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEditing ? "Update Category" : "Create Category"}</Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryFormPage;

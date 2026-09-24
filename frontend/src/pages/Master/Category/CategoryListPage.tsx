import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { Pencil, Plus, Trash2 } from "lucide-react";
import DataTable from "../../../components/ui/data-table";
import { Button } from "../../../components/ui";
import { categoryService } from "../../../services/category.service";
import type { CategoryResponse } from "../../../types";

const CategoryListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAll({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: search || undefined,
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination, search]);

  useEffect(() => {
    const timer = window.setTimeout(loadCategories, 250);
    return () => window.clearTimeout(timer);
  }, [loadCategories]);

  const columnDefs = useMemo<ColDef<CategoryResponse>[]>(
    () => [
      { field: "name", headerName: "Category", minWidth: 180, flex: 1.4 },
      { field: "description", headerName: "Description", minWidth: 220, flex: 2 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        cellRenderer: ({ value }: { value: string }) => (
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${
            value === "active"
              ? "border-green-500/30 bg-green-500/15 text-green-400"
              : "border-gray-500/30 bg-gray-500/15 text-gray-400"
          }`}>
            {value}
          </span>
        ),
      },
      { field: "createdBy", headerName: "Created By", minWidth: 180 },
      {
        field: "createdAt",
        headerName: "Created At",
        minWidth: 150,
        valueFormatter: ({ value }) => (value ? new Date(value).toLocaleDateString() : "-"),
      },
      {
        headerName: "Actions",
        minWidth: 120,
        sortable: false,
        filter: false,
        cellRenderer: ({ data }: { data?: CategoryResponse }) => data ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(`/master/categories/${data.id}/edit`)}
              className="rounded-md p-2 text-blue-400 hover:bg-blue-500/15"
              title="Edit category"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`Delete ${data.name}?`)) return;
                await categoryService.delete(data.id);
                await loadCategories();
              }}
              className="rounded-md p-2 text-red-400 hover:bg-red-500/15"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null,
      },
    ],
    [loadCategories, navigate],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="mt-1 text-gray-400">Manage product categories.</p>
        </div>
        <Button onClick={() => navigate("/master/categories/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <section className="rounded-2xl border border-gray-700 bg-gray-900/50 p-4">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          placeholder="Search categories..."
          className="mb-4 w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-white outline-none focus:border-amber-500"
        />
        <DataTable
          data={categories}
          columnDefs={columnDefs}
          loading={loading}
          rowCount={categories.length}
          paginationState={pagination}
          onPaginationChange={setPagination}
        />
      </section>
    </div>
  );
};

export default CategoryListPage;

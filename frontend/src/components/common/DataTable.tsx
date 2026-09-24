import { useState, useMemo } from "react";
import { Button } from "../ui";

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        onPageChange: (page: number) => void;
        onLimitChange: (limit: number) => void;
    };
    loading?: boolean;
    emptyMessage?: string;
    actions?: {
        header: string;
        render: (item: T) => React.ReactNode;
    };
    striped?: boolean;
    hoverable?: boolean;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    pagination,
    loading = false,
    emptyMessage = "No data available",
    actions,
    striped = true,
    hoverable = true,
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    const sortedData = useMemo(() => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            const aVal = (a as any)[sortConfig.key];
            const bVal = (b as any)[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev?.key === key && prev.direction === "asc") {
                return { key, direction: "desc" };
            }
            return { key, direction: "asc" };
        });
    };

    if (loading) {
        return (
            <div className="w-full py-12 text-center">
                <div className="inline-flex items-center gap-3 text-amber-500">
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-700">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-left font-semibold text-gray-300 uppercase tracking-wider ${column.className || ""}`}
                                onClick={() => column.render ? null : handleSort(column.key)}
                                style={{ cursor: column.render ? "default" : "pointer" }}
                            >
                                <div className="flex items-center gap-2">
                                    {column.header}
                                    {sortConfig?.key === column.key && !column.render && (
                                        <svg className={`w-4 h-4 ${sortConfig?.direction === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    )}
                                </div>
                            </th>
                        ))}
                        {actions && <th className="px-4 py-3 text-left font-semibold text-gray-300 uppercase tracking-wider">{actions.header}</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((item, index) => (
                            <tr
                                key={keyExtractor(item)}
                                className={`
                                    transition-colors duration-150
                                    ${hoverable ? "hover:bg-gray-800/50" : ""}
                                    ${striped && index % 2 === 1 ? "bg-gray-800/30" : ""}
                                `}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className={`px-4 py-3 text-gray-300 ${column.className || ""}`}>
                                        {column.render ? column.render(item, index) : (item as any)[column.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-4 py-3">
                                        {actions.render(item)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {pagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-4 border-t border-gray-800">
                    <div className="text-sm text-gray-400">
                        Showing <span className="font-medium text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to
                        <span className="font-medium text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of
                        <span className="font-medium text-white">{pagination.total}</span> results
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={pagination.limit}
                            onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                            className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => pagination.onPageChange(pagination.page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-300">
                                Page <span className="font-medium text-white">{pagination.page}</span> of <span className="font-medium text-white">{Math.ceil(pagination.total / pagination.limit) || 1}</span>
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || Math.ceil(pagination.total / pagination.limit) === 0}
                                onClick={() => pagination.onPageChange(pagination.page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
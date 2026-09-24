import { useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridOptions,
  GridReadyEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export interface DataTablePagination {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableProps<T extends object> {
  data: T[];
  columnDefs: ColDef<T>[];
  gridOptions?: Partial<GridOptions<T>>;
  loading?: boolean;
  className?: string;
  rowCount?: number;
  paginationState?: DataTablePagination;
  onPaginationChange?: (pagination: DataTablePagination) => void;
  manualPagination?: boolean;
  pageSizeOptions?: number[];
  enableRowSelection?: boolean;
  selectionType?: "single" | "multiple";
  onSelectionChanged?: (rows: T[]) => void;
  onGridReady?: (event: GridReadyEvent<T>) => void;
}

function DataTable<T extends object>({
  data,
  columnDefs,
  gridOptions = {},
  loading = false,
  className = "",
  rowCount = 0,
  paginationState = { pageIndex: 0, pageSize: 10 },
  onPaginationChange,
  manualPagination = true,
  pageSizeOptions = [10, 25, 50, 100],
  enableRowSelection = false,
  selectionType = "single",
  onSelectionChanged,
  onGridReady,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(rowCount / paginationState.pageSize));
  const currentPage = Math.min(paginationState.pageIndex + 1, totalPages);

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const changePage = (pageIndex: number) => {
    onPaginationChange?.({
      ...paginationState,
      pageIndex: Math.max(0, Math.min(pageIndex, totalPages - 1)),
    });
  };

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<T>) => onSelectionChanged?.(event.api.getSelectedRows()),
    [onSelectionChanged],
  );

  const handleGridReady = useCallback(
    (event: GridReadyEvent<T>) => {
      if (manualPagination) {
        event.api.setGridOption("pagination", false);
      }
      onGridReady?.(event);
    },
    [manualPagination, onGridReady],
  );

  const defaultGridOptions = useMemo<GridOptions<T>>(
    () => ({
      domLayout: "autoHeight",
      rowHeight: 48,
      headerHeight: 46,
      animateRows: true,
      suppressCellFocus: true,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 120,
        flex: 1,
      },
      rowSelection: enableRowSelection
        ? {
            mode: selectionType === "multiple" ? "multiRow" : "singleRow",
            checkboxes: selectionType === "multiple",
            headerCheckbox: selectionType === "multiple",
            enableClickSelection: false,
          }
        : undefined,
      overlayNoRowsTemplate: '<span class="ag-overlay-no-rows">No data available</span>',
    }),
    [enableRowSelection, selectionType],
  );

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <div className="relative w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/50">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        )}
        <div className="ag-theme-quartz-dark min-h-[400px] w-full">
          <AgGridReact<T>
            rowData={data}
            columnDefs={columnDefs}
            gridOptions={{ ...defaultGridOptions, ...gridOptions }}
            onGridReady={handleGridReady}
            onSelectionChanged={handleSelectionChanged}
          />
        </div>
      </div>

      {manualPagination && onPaginationChange && (
        <div className="flex flex-col gap-3 border-t border-gray-800 bg-gray-900 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400">
            Total: <strong className="text-white">{rowCount}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => changePage(currentPage - 2)}
              disabled={currentPage === 1 || loading}
              className="rounded-md border border-gray-700 p-2 text-gray-300 hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => changePage(page - 1)}
                className={`h-8 min-w-8 rounded-md border px-2 text-sm ${
                  page === currentPage
                    ? "border-amber-500 bg-amber-500 text-black"
                    : "border-gray-700 text-gray-300 hover:border-amber-500"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => changePage(currentPage)}
              disabled={currentPage === totalPages || loading}
              className="rounded-md border border-gray-700 p-2 text-gray-300 hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            Rows
            <select
              value={paginationState.pageSize}
              onChange={(event) =>
                onPaginationChange({
                  pageIndex: 0,
                  pageSize: Number(event.target.value),
                })
              }
              className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-white"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

export default DataTable;

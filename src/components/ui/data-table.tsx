/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  HeaderGroup,
  Row,
  Table as ReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

// ✅ Props type — generic so you can reuse with any row type
interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cryptoTableSorting");
      if (saved) {
        try {
          const parsedSorting: SortingState = JSON.parse(saved);
          const validSorting = parsedSorting.filter((sort) =>
            columns.some(
              (col) => "accessorKey" in col && col.accessorKey === sort.id
            )
          );

          return validSorting;
        } catch (error) {
          console.warn("Failed to parse saved sorting:", error);
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("cryptoTableSorting", JSON.stringify(sorting));
    } catch (error) {
      console.warn("Failed to save sorting to localStorage:", error);
    }
  }, [sorting]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // ✅ Refs: type-safe
  const scrollRefs = useRef<{
    top: HTMLDivElement | null;
    main: HTMLDivElement | null;
  }>({ top: null, main: null });

  const [scrollWidth, setScrollWidth] = useState("100%");

  useEffect(() => {
    const main = scrollRefs.current.main;
    if (main) {
      setScrollWidth(`${main.scrollWidth}px`);
    }
  }, [data]);

  const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft } = e.currentTarget;
    if (e.currentTarget === scrollRefs.current.top && scrollRefs.current.main) {
      scrollRefs.current.main.scrollLeft = scrollLeft;
    } else if (
      e.currentTarget === scrollRefs.current.main &&
      scrollRefs.current.top
    ) {
      scrollRefs.current.top.scrollLeft = scrollLeft;
    }
  };

  // ✅ Check if any column has a footer
  const hasFooter = columns.some((column) => column.footer);

  return (
    <div className="relative w-full">
      {/* Top scroll bar */}
      <div
        className="sticky top-0 z-10 overflow-x-auto overflow-y-hidden mb-1"
        ref={(ref) => (scrollRefs.current.top = ref)}
        onScroll={syncScroll}
      >
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>

      {/* Main table with scroll */}
      <div
        className="overflow-x-auto"
        ref={(ref) => (scrollRefs.current.main = ref)}
        onScroll={syncScroll}
      >
        <div className="rounded-md border border-gray-700 bg-gray-900/50 backdrop-blur-sm w-full min-w-max">
          <Table>
            <TableHeader className="bg-gray-900 hover:bg-gray-800/70 transition-colors">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-gray-700/50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`text-right text-sm font-medium text-gray-300 uppercase tracking-wider text-nowrap px-4 py-3 ${
                        header.column.id === "estimatedNext24hChange"
                          ? "bg-blue-900/30"
                          : ""
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center rounded"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="mr-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              <ChevronUp
                                size={14}
                                className={
                                  header.column.getIsSorted() === "asc"
                                    ? "text-green-400"
                                    : "text-gray-400"
                                }
                              />
                              <ChevronDown
                                size={14}
                                className={
                                  header.column.getIsSorted() === "desc"
                                    ? "text-red-400"
                                    : "text-gray-400"
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-800/70 transition-colors border-b border-gray-700/50"
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (
                        cell.column.id === "serialNo" ||
                        cell.column.id === "sNo"
                      ) {
                        return (
                          <TableCell
                            key={cell.id}
                            className="px-4 py-3 whitespace-nowrap text-right text-sm"
                          >
                            {index + 1}.
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={cell.id}
                          className={`px-4 py-3 whitespace-nowrap text-right text-sm ${
                            cell.column.id === "estimatedNext24hChange"
                              ? "bg-blue-900/30"
                              : ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {hasFooter && (
              <tfoot className="bg-gray-800 border-t border-gray-700">
                {table.getFooterGroups().map((footerGroup) => (
                  <TableRow
                    key={footerGroup.id}
                    className="border-t border-gray-700/50"
                  >
                    {footerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        className="px-4 py-3 text-sm font-medium text-right"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.footer,
                              header.getContext()
                            )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tfoot>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}

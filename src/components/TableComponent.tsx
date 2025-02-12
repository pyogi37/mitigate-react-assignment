import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnDef,
    flexRender,
    SortingState,
} from "@tanstack/react-table";
import { FiCheckCircle, FiDownload, FiPauseCircle, FiXCircle, FiTrash2 } from "react-icons/fi";
import Button from "./ui/button";
import Card from "./ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    FiCalendar,
    FiArrowUp,
    FiArrowDown
} from "react-icons/fi";

interface Data {
    id: number;
    name: string;
    email: string;
    status: "Active" | "Inactive" | "Blocked";
    startDate: Date;
    invitedBy: string;
}

const TableComponent: React.FC = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageChange, setPageChange] = useState(false);
    const [data, setData] = useState<Data[]>(
        Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            status: ["Active", "Inactive", "Blocked"][Math.floor(Math.random() * 3)] as Data["status"],
            startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            invitedBy: "Ankit Mehta",
        }))
    );
    const stats = useMemo(() => {
        const total = data.length;
        return {
            total,
            active: data.filter((user) => user.status === "Active").length,
            inactive: Math.round((data.filter((user) => user.status === "Inactive").length / total) * 100) + '%',
            blocked: Math.round((data.filter((user) => user.status === "Blocked").length / total) * 100) + '%'
        };
    }, [data]);

    const [visibleRows, setVisibleRows] = useState(10);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (!pageChange) {
            const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && visibleRows <= 5) {
                setVisibleRows(10);
            }
        }
        setPageChange(false);
    };

    const handlePageChange = (action: 'next' | 'previous') => {
        if (action === 'next' && table.getCanNextPage()) {
            table.nextPage();
        } else if (action === 'previous' && table.getCanPreviousPage()) {
            table.previousPage();
        }

        containerRef.current?.scrollTo({
            top: 0,
            behavior: 'instant'
        });

        setPageChange(true);

        // Reset visible rows and scroll to top
        setVisibleRows(5);
    };

    const columns: ColumnDef<Data>[] = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "name",
                enableSorting: true,
                sortingFn: 'alphanumeric'
            },
            {
                header: "Email",
                accessorKey: "email",
                enableSorting: true,
                sortingFn: 'alphanumeric'
            },
            {
                header: "Start Date",
                accessorKey: "startDate",
                cell: ({ row }) => (
                    <span>{row.original.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                ),
                enableSorting: true,
                sortingFn: 'alphanumeric'
            },
            {
                header: "Invited By",
                accessorKey: "invitedBy",
                enableSorting: true,
                sortingFn: 'alphanumeric'
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => (
                    <span className={`px-3 py-1 rounded-full text-white font-semibold text-sm ${getStatusColor(row.original.status)}`}>
                        {row.original.status}
                    </span>
                ),
                enableSorting: true,
                sortingFn: 'alphanumeric'
            },
            {
                header: "Action",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleChangeStatus(row.original.id, "Active")}
                            className="p-1 bg-green-500 text-white rounded-md"
                        >
                            <FiCheckCircle />
                        </button>
                        <button
                            onClick={() => handleChangeStatus(row.original.id, "Inactive")}
                            className="p-1 bg-gray-500 text-white rounded-md"
                        >
                            <FiPauseCircle />
                        </button>
                        <button
                            onClick={() => handleChangeStatus(row.original.id, "Blocked")}
                            className="p-1 bg-red-500 text-white rounded-md"
                        >
                            <FiXCircle />
                        </button>
                    </div>
                ),
                enableSorting: true,
            },
        ],
        []
    );

    const getStatusColor = (status: Data["status"]) => {
        return status === "Active" ? "bg-green-500" : status === "Inactive" ? "bg-gray-400" : "bg-red-500";
    };

    const handleChangeStatus = (id: number, newStatus: "Active" | "Inactive" | "Blocked") => {
        setData((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, status: newStatus } : user
            )
        );
    };

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        setVisibleRows(5); // Initially show 5 rows
    }, [pagination.pageIndex]);


    const filteredData = useMemo(() => {
        let filtered = data.filter((user) => {
            const matchesSearch =
                search === "" ||
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === "" || user.status === statusFilter;

            const matchesDate =
                !dateFilter || user.startDate.toDateString() === dateFilter.toDateString();

            return matchesSearch && matchesStatus && matchesDate;
        });

        return filtered;

    }, [data, search, statusFilter, dateFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            pagination: {
                ...pagination,
                pageSize: 10,
            },
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        enableSorting: true,
    });

    const handleDownload = () => {
        const csvContent =
            "data:text/csv;charset=utf-8,Name,Email,Status,Start Date,Invited By\n" +
            data.map(u => `${u.name},${u.email},${u.status},${u.startDate.toDateString()},${u.invitedBy}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setDateFilter(null);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">User Details</h2>
                <div className="flex gap-2">
                    <Button onClick={handleDownload} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">
                        <FiDownload /> Download Report
                    </Button>
                    <Button onClick={handleClearFilters} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg">
                        <FiTrash2 /> Clear Filters
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <Card label="Total Users" value={stats.total} />
                <Card label="Active Users" value={stats.active} />
                <Card label="Inactive Users" percentage={stats.inactive} />
                <Card label="Blocked Users" percentage={stats.blocked} />
            </div>

            <div className="flex justify-between mb-4 gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search"
                        className="border p-2 rounded w-1/10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <select
                        className="border p-2 rounded"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Blocked">Blocked</option>
                    </select>

                    <DatePicker
                        selected={dateFilter}
                        onChange={(date) => setDateFilter(date)}
                        placeholderText="Select Date"
                        className="mr-4"
                        customInput={
                            <button className="border p-2 rounded flex items-center gap-2">
                                <FiCalendar className="text-gray-500" size={18} />
                            </button>
                        }
                    />
                </div>
            </div>

            <div
                ref={containerRef}
                className="max-h-[300px] overflow-auto"
                onScroll={handleScroll}
            >
                <table className="w-full border-t border-b border-gray-300">
                    <thead className="bg-gray-100 text-left border-b border-gray-300">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="p-3 text-sm font-medium cursor-pointer select-none"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() && (
                                                header.column.getIsSorted() === 'asc'
                                                    ? <FiArrowUp className="text-gray-600" />
                                                    : <FiArrowDown className="text-gray-600" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.slice(0, visibleRows).map((row) => (
                            <tr key={row.id} className="border-b border-gray-300 hover:bg-gray-50">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3 text-sm">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {visibleRows <= 5 && (
                            <tr>
                                <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                                    Scroll to load more...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">
                    Page {pagination.pageIndex + 1} of {table.getPageCount()}
                </span>

                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange('previous')}
                        disabled={!table.getCanPreviousPage()}
                        className={`px-4 py-2 border rounded ${!table.getCanPreviousPage() ? "text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"}`}
                    >
                        Previous
                    </button>

                    <button
                        onClick={() => handlePageChange('next')}
                        disabled={!table.getCanNextPage()}
                        className={`px-4 py-2 border rounded ${!table.getCanNextPage() ? "text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableComponent;

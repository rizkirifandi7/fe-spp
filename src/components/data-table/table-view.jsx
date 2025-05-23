"use client";

import React, { useState } from "react"; // Pastikan React diimpor jika belum
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Card digunakan untuk membungkus tabel
import { AlertTriangle, Search, Loader2, Info } from "lucide-react"; // Mengimpor ikon yang dibutuhkan

// Diasumsikan cn utility sudah ada di "@/lib/utils"
const cn = (...inputs) => inputs.filter(Boolean).join(" ");

const TableView = ({
	columns,
	data,
	title,
	searchKey, // Kunci kolom yang akan digunakan untuk filter global
	TambahComponent, // Komponen untuk tombol "Tambah Data" atau sejenisnya
	pageSize = 10,
	isLoading = false,
	error = null,
}) => {
	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	// const [columnVisibility, setColumnVisibility] = useState({}); // Tidak digunakan di JSX, bisa di-uncomment jika perlu
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState(""); // State untuk filter global

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters, // Untuk filter per kolom jika diimplementasikan
		onGlobalFilterChange: setGlobalFilter, // Untuk filter global
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// onColumnVisibilityChange: setColumnVisibility, // Tidak digunakan di JSX
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			// columnVisibility, // Tidak digunakan di JSX
			rowSelection,
			globalFilter, // Menambahkan globalFilter ke state tabel
		},
		initialState: {
			pagination: {
				pageSize,
			},
		},
		// Jika searchKey tidak spesifik ke satu kolom, tapi filter global
		// maka kita tidak perlu getColumn(searchKey) lagi.
		// TanStack Table v8 menangani filter global melalui state.globalFilter
	});

	return (
		<div className="space-y-6 p-4 md:p-6 rounded-xl shadow-sm dark:bg-gray-950 border border-gray-200 dark:border-slate-800">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 pb-5">
				<h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-slate-100">
					{title}
				</h1>
			</div>

			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="relative w-full sm:max-w-md">
					<Input
						placeholder={`Cari ${searchKey || "data"}...`}
						value={globalFilter ?? ""}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-10 pr-4 py-2.5 shadow-sm border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm"
						disabled={isLoading}
					/>
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="w-5 h-5 text-gray-400 dark:text-slate-500" />
					</div>
				</div>

				{TambahComponent && (
					<div className="w-full sm:w-auto">{TambahComponent}</div>
				)}
			</div>

			{error ? (
				<div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-6 text-center">
					<AlertTriangle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-3" />
					<p className="font-semibold text-lg text-red-700 dark:text-red-300">
						Terjadi Kesalahan
					</p>
					<p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
				</div>
			) : (
				<Card className="w-full rounded-xl border border-gray-200 dark:border-slate-700 shadow-md overflow-hidden bg-white dark:bg-slate-800 p-0">
					<div className="w-full overflow-x-auto">
						<Table>
							<TableHeader className="bg-gray-100 dark:bg-slate-700/50">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow
										key={headerGroup.id}
										className="border-b border-gray-200 dark:border-slate-700"
									>
										{headerGroup.headers.map((header) => (
											<TableHead
												key={header.id}
												className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
											>
												{!header.isPlaceholder &&
													flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
								{isLoading ? (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-48 text-center text-gray-500 dark:text-slate-400"
										>
											<div className="flex flex-col justify-center items-center space-y-3">
												<Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
												<span className="text-md font-medium">
													Memuat data...
												</span>
											</div>
										</TableCell>
									</TableRow>
								) : table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											className={cn(
												"hover:bg-emerald-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150",
												row.getIsSelected() &&
													"bg-emerald-50 dark:bg-emerald-700/20"
											)}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300"
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-48 text-center text-gray-500 dark:text-slate-400"
										>
											<div className="flex flex-col justify-center items-center space-y-3">
												<Info className="h-12 w-12 text-gray-300 dark:text-slate-600" />
												<span className="text-md font-medium">
													Tidak ada data yang tersedia.
												</span>
												<span className="text-xs">
													Coba ubah filter pencarian Anda.
												</span>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</Card>
			)}

			{table.getPageCount() > 1 && !error && (
				<div className="flex flex-col sm:flex-row items-center justify-between pt-5 gap-4">
					<div className="text-sm text-gray-600 dark:text-slate-400">
						{table.getFilteredSelectedRowModel().rows.length > 0
							? `${table.getFilteredSelectedRowModel().rows.length} dari ${
									table.getFilteredRowModel().rows.length
							  } baris dipilih.`
							: `Total ${table.getFilteredRowModel().rows.length} baris.`}
						{` Halaman ${
							table.getState().pagination.pageIndex + 1
						} dari ${table.getPageCount()}`}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage() || isLoading}
							className="px-3 py-1.5 text-sm border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-60 rounded-md"
						>
							{"<<"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage() || isLoading}
							className="px-3 py-1.5 text-sm border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-60 rounded-md"
						>
							Sebelumnya
						</Button>
						<span className="text-sm text-gray-700 dark:text-slate-300 px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800">
							{table.getState().pagination.pageIndex + 1}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage() || isLoading}
							className="px-3 py-1.5 text-sm border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-60 rounded-md"
						>
							Berikutnya
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage() || isLoading}
							className="px-3 py-1.5 text-sm border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-60 rounded-md"
						>
							{">>"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default TableView;

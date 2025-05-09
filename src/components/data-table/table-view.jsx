"use client";

import { useState } from "react";
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
import { Card } from "../ui/card";

const TableView = ({
	columns,
	data,
	title,
	searchKey,
	TambahComponent,
	pageSize = 10,
	isLoading = false,
	error = null,
}) => {
	const [sorting, setSorting] = useState([]);
	const [columnFilters, setColumnFilters] = useState([]);
	const [columnVisibility, setColumnVisibility] = useState({});
	const [rowSelection, setRowSelection] = useState({});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		initialState: {
			pagination: {
				pageSize,
			},
		},
	});

	return (
		<div className="space-y-6 p-4 md:p-6 rounded-lg shadow-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
				<h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
					{title}
				</h1>
			</div>

			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="relative w-full sm:max-w-xs">
					<Input
						placeholder={`Cari ${searchKey || "data"}...`}
						value={table.getColumn(searchKey)?.getFilterValue() ?? ""}
						onChange={(e) =>
							table.getColumn(searchKey)?.setFilterValue(e.target.value)
						}
						className="pl-10 pr-4 py-2 shadow-sm border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-200 rounded-md"
						disabled={isLoading}
					/>
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						{/* You can use an SVG icon here for search */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-5 h-5 text-slate-400 dark:text-slate-500"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
							/>
						</svg>
					</div>
				</div>

				{TambahComponent && (
					<div className="w-full sm:w-auto">{TambahComponent}</div>
				)}
			</div>

			{error ? (
				<div className="rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-4 text-center text-red-600 dark:text-red-400">
					<p className="font-medium">Terjadi Kesalahan</p>
					<p className="text-sm">{error}</p>
				</div>
			) : (
				<Card className="w-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden bg-transparent dark:bg-transparent p-0">
					<div className="w-full overflow-x-auto">
						{" "}
						{/* This class handles horizontal scrolling and ensures it takes full parent width */}{" "}
						{/* This class handles horizontal scrolling */}
						<Table>
							<TableHeader className="bg-slate-50 dark:bg-slate-800">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow
										key={headerGroup.id}
										className="border-b border-slate-200 dark:border-slate-700"
									>
										{headerGroup.headers.map((header) => (
											<TableHead
												key={header.id}
												className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
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
							<TableBody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
								{isLoading ? (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-32 text-center text-slate-500 dark:text-slate-400"
										>
											<div className="flex justify-center items-center space-x-2">
												{/* You can use a spinner SVG or component here */}
												<svg
													className="animate-spin h-5 w-5 text-blue-600"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
												<span>Memuat data...</span>
											</div>
										</TableCell>
									</TableRow>
								) : table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row, index) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
												row.getIsSelected()
													? "bg-blue-50 dark:bg-blue-900/30"
													: index % 2 === 0
													? "bg-white dark:bg-slate-900"
													: "bg-slate-50/50 dark:bg-slate-800/30"
											}`}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300"
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
											className="h-32 text-center text-slate-500 dark:text-slate-400"
										>
											Tidak ada data yang tersedia.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</Card>
			)}

			<div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
				<div className="text-sm text-slate-600 dark:text-slate-400">
					{table.getFilteredSelectedRowModel().rows.length > 0
						? `${table.getFilteredSelectedRowModel().rows.length} dari ${
								table.getFilteredRowModel().rows.length
						  } baris dipilih.`
						: `Total ${table.getFilteredRowModel().rows.length} baris.`}
					{table.getPageCount() > 0 &&
						` Halaman ${
							table.getState().pagination.pageIndex + 1
						} dari ${table.getPageCount()}`}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage() || isLoading}
						className="px-3 py-1.5 text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
					>
						{"<<"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage() || isLoading}
						className="px-3 py-1.5 text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
					>
						Sebelumnya
					</Button>
					<span className="text-sm text-slate-600 dark:text-slate-400">
						{table.getState().pagination.pageIndex + 1}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage() || isLoading}
						className="px-3 py-1.5 text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
					>
						Berikutnya
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage() || isLoading}
						className="px-3 py-1.5 text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
					>
						{">>"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default TableView;

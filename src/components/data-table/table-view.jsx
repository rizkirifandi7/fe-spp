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
		<div className="w-full space-y-4 border p-3 rounded-md shadow bg-white dark:bg-gray-900">
			<div className="flex items-center justify-between border-b pb-2">
				<h1 className="text-xl font-semibold">{title}</h1>
			</div>

			<div className="flex items-center justify-between gap-2">
				<Input
					placeholder="Cari data..."
					value={table.getColumn(searchKey)?.getFilterValue() ?? ""}
					onChange={(e) =>
						table.getColumn(searchKey)?.setFilterValue(e.target.value)
					}
					className="max-w-sm shadow-none"
					disabled={isLoading}
				/>

				{TambahComponent}
			</div>

			{error ? (
				<div className="rounded-md border p-3 text-center text-destructive">
					{error}
				</div>
			) : (
				<Card className="rounded-md border p-3 shadow-none">
					<Table>
						<TableHeader className="bg-gray-100 dark:bg-gray-800 border rounded-md uppercase">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
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
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										Loading...
									</TableCell>
								</TableRow>
							) : table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
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
										className="h-24 text-center"
									>
										No data available
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</Card>
			)}

			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage() || isLoading}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage() || isLoading}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};

export default TableView;

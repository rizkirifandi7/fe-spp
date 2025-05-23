"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { formatToIDR } from "@/lib/formatIdr";
import UpdateKas from "./update-kas";
import TambahKas from "./tambah-kas";
import TableView from "@/components/data-table/table-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"; // Pastikan path ini benar

const TableKas = ({ onDataChanged }) => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/kas`
			);
			setData(response.data.data || []);
		} catch (err) {
			console.error("Error fetching kas data:", err);
			setError(
				err.response?.data?.message || err.message || "Gagal memuat data kas."
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSuccess = () => {
		fetchData();
		if (onDataChanged) {
			onDataChanged();
		}
	};

	const columns = [
		{
			accessorKey: "nama",
			header: "Nama",
			cell: ({ row }) => {
				const dataNama = row.original?.akun?.nama;
				return <div className="">{dataNama}</div>;
			},
		},
		{
			accessorKey: "deskripsi",
			header: "Deskripsi",
			cell: ({ row }) => {
				const deskripsiLengkap = row.getValue("deskripsi");
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="">
									{deskripsiLengkap}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs break-words">{deskripsiLengkap}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
			},
		},
		{
			accessorKey: "jumlah",
			header: "Jumlah",
			cell: ({ row }) => {
				const jumlah = parseFloat(row.getValue("jumlah"));
				const tipe = row.original.tipe;
				return (
					<div
						className={`font-medium max-w-[120px] ${
							tipe === "masuk"
								? "text-emerald-600 dark:text-emerald-500"
								: "text-red-600 dark:text-red-500"
						}`}
					>
						{tipe === "masuk" ? "+ " : "- "}
						{formatToIDR(jumlah)}
					</div>
				);
			},
		},
		{
			accessorKey: "tipe",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Tipe
						<ArrowUpDown />
					</Button>
				);
			},
			cell: ({ row }) => {
				const tipe = row.getValue("tipe");
				return (
					<Badge
						variant={tipe === "masuk" ? "default" : "secondary"}
						className={`uppercase text-xs w-fit min-w-[70px] justify-center ${
							tipe === "masuk"
								? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-700 dark:text-emerald-100 dark:border-emerald-500"
								: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500"
						}`}
					>
						{tipe}
					</Badge>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "Tanggal",
			cell: ({ row }) => {
				const date = new Date(row.getValue("createdAt"));
				return (
					<div className="min-w-[100px]">
						{date.toLocaleDateString("id-ID", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</div>
				);
			},
		},
		{
			id: "actions",
			header: "Aksi",
			cell: ({ row }) => {
				const { id } = row.original;
				const rowData = row.original;
				return (
					<div className="flex items-center space-x-2 min-w-[100px]">
						<UpdateKas id={id} rowData={rowData} onSuccess={handleSuccess} />
					</div>
				);
			},
		},
	];

	return (
		<TableView
			columns={columns}
			data={data}
			isLoading={isLoading}
			error={error}
			TambahComponent={<TambahKas onSuccess={handleSuccess} />}
			title="Riwayat Transaksi Kas"
			searchKey="deskripsi"
			searchPlaceholder="Cari deskripsi..."
		/>
	);
};

export default TableKas;

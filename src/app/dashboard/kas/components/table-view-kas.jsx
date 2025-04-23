"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { formatToIDR } from "@/lib/formatIdr";
import UpdateKas from "./update-kas";
import HapusKas from "./hapus-kas";
import TambahKas from "./tambah-kas";
import TableView from "@/components/data-table/table-view";

const TableKas = ({ onDataAdded }) => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "deskripsi",
			header: "Deskripsi",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{row.getValue("deskripsi")}
				</div>
			),
		},
		{
			accessorKey: "jumlah",
			header: "Jumlah",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{formatToIDR(row.getValue("jumlah"))}
				</div>
			),
		},
		{
			accessorKey: "tipe",
			header: "Tipe",
			cell: ({ row }) => {
				const tipe = row.getValue("tipe");
				return (
					<div
						className={`overflow-x-auto uppercase border p-1 rounded-sm text-center w-fit ${
							tipe?.toLowerCase() === "masuk"
								? "bg-green-100 text-green-800 border-green-300"
								: "bg-gray-100 text-gray-800 border-gray-300"
						}`}
					>
						{tipe}
					</div>
				);
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const { id } = row.original;
				const rowData = row.original;
				return (
					<div className="flex items-center gap-2">
						<UpdateKas
							onSuccess={fetchData}
							id={id}
							rowData={rowData}
							onDataAdded={onDataAdded}
						/>
						<HapusKas id={id} onSuccess={fetchData} onDataAdded={onDataAdded} />
					</div>
				);
			},
		},
	];

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/kas`
			);
			setData(response.data.data);
		} catch (err) {
			console.error("Error fetching unit data:", err);
			setError("Gagal memuat data kas");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<TableView
			columns={columns}
			data={data}
			isLoading={isLoading}
			error={error}
			TambahComponent={
				<TambahKas onSuccess={fetchData} onDataAdded={onDataAdded} />
			}
			title="Manajemen Kas"
			searchKey="deskripsi"
		/>
	);
};

export default TableKas;

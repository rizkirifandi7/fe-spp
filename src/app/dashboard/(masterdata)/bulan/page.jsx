"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import TambahBulan from "./components/tambah-bulan";
import UpdateBulan from "./components/update-bulan";
import HapusBulan from "./components/hapus-bulan";

const BulanPage = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "nama_bulan",
			header: "Nama Bulan",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.getValue("nama_bulan")}</div>
			),
		},
		{
			accessorKey: "nomor_bulan",
			header: "Nomor Bulan",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.getValue("nomor_bulan")}</div>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status");
				return (
					<div
						className={`overflow-x-auto uppercase border p-1 rounded-sm text-center w-fit ${
							status?.toLowerCase() === "on"
								? "bg-green-100 text-green-800 border-green-300"
								: "bg-gray-100 text-gray-800 border-gray-300"
						}`}
					>
						{status}
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
						<UpdateBulan onSuccess={fetchData} id={id} rowData={rowData} />
						<HapusBulan id={id} onSuccess={fetchData} />
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
				`${process.env.NEXT_PUBLIC_API_URL}/bulan`
			);
			setData(response.data.data);
		} catch (err) {
			console.error("Error fetching unit data:", err);
			setError("Gagal memuat data bulan");
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
			TambahComponent={<TambahBulan onSuccess={fetchData} />}
			title="Dashboard Bulan"
			searchKey="nama_bulan"
		/>
	);
};

export default BulanPage;

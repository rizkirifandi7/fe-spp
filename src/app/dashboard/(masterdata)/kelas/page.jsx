"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import HapusKelas from "./components/hapus-kelas";
import UpdateKelas from "./components/update-kelas";
import TambahKelas from "./components/tambah-kelas";

const PageKelas = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "id_unit",
			header: "Nama Unit",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{row.original?.unit?.nama_unit}
				</div>
			),
		},
		{
			accessorKey: "nama_kelas",
			header: "Nama Kelas",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{row.getValue("nama_kelas")}
				</div>
			),
		},
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
						<UpdateKelas onSuccess={fetchData} id={id} rowData={rowData} />
						<HapusKelas id={id} onSuccess={fetchData} />
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
				`${process.env.NEXT_PUBLIC_API_URL}/kelas`
			);
			setData(response.data.data);
		} catch (err) {
			console.error("Error fetching unit data:", err);
			setError("Gagal memuat data kelas");
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
			TambahComponent={<TambahKelas onSuccess={fetchData} />}
			title="Manajemen Kelas"
			searchKey="nama_kelas"
		/>
	);
};

export default PageKelas;

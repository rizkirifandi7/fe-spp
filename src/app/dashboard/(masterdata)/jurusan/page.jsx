"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import UpdateJurusan from "./components/update-jurusan";
import HapusJurusan from "./components/hapus-jurusan";
import TambahJurusan from "./components/tambah-jurusan";

const PageJurusan = () => {
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
			accessorKey: "nama_jurusan",
			header: "Nama Jurusan",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{row.getValue("nama_jurusan")}
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
						<UpdateJurusan onSuccess={fetchData} id={id} rowData={rowData} />
						<HapusJurusan id={id} onSuccess={fetchData} />
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
				`${process.env.NEXT_PUBLIC_API_URL}/jurusan`
			);
			setData(response.data.data);
		} catch (err) {
			console.error("Error fetching unit data:", err);
			setError("Gagal memuat data jurusan");
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
			TambahComponent={<TambahJurusan onSuccess={fetchData} />}
			title="Manajemen Jurusan"
			searchKey="nama_jurusan"
		/>
	);
};

export default PageJurusan;

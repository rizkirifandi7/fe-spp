"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import TambahAdmin from "./_components/tambah-guru";
import UpdateAdmin from "./_components/update-guru";
import HapusAdmin from "./_components/hapus-guru";

const PageGuru = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "gambar",
			header: "Gambar",
			cell: ({ row }) => (
				<div className=" overflow-x-auto">{row.getValue("gambar")}</div>
			),
		},
		{
			accessorKey: "nama",
			header: "Nama",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">{row.getValue("nama")}</div>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">{row.getValue("email")}</div>
			),
		},
		{
			accessorKey: "telepon",
			header: "Telepon",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.getValue("telepon")}</div>
			),
		},
		{
			accessorKey: "tgl_lahir",
			header: "Tanggal Lahir",
			cell: ({ row }) => {
				const dateValue = row.getValue("tgl_lahir");
				if (!dateValue) return <div>-</div>;

				const date = new Date(dateValue);
				if (isNaN(date.getTime())) return <div>-</div>; // Handle invalid dates

				// Format date as DD-MM-YYYY
				const day = date.getDate().toString().padStart(2, "0");
				const month = (date.getMonth() + 1).toString().padStart(2, "0");
				const year = date.getFullYear();

				const formattedDate = `${day}-${month}-${year}`;

				return <div className="">{formattedDate}</div>;
			},
		},
		{
			accessorKey: "alamat",
			header: "Alamat",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{row.getValue("alamat")}
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
						<UpdateAdmin onSuccess={fetchData} id={id} rowData={rowData} />
						<HapusAdmin id={id} onSuccess={fetchData} />
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
				`${process.env.NEXT_PUBLIC_API_URL}/akun`
			);

			const filterRole = response.data.data.filter(
				(item) => item.role === "guru"
			);

			console.log(filterRole);

			setData(filterRole);
		} catch (err) {
			console.error("Error fetching unit data:", err);
			setError("Gagal memuat data akun");
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
			TambahComponent={<TambahAdmin onSuccess={fetchData} />}
			title="Manajemen Guru"
			searchKey="nama"
		/>
	);
};

export default PageGuru;

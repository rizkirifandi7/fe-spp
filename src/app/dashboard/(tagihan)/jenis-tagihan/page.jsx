"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";

import TambahTipePembayaran from "./_components/tambah-jenis-pembayaran";
import UpdateTipePembayaran from "./_components/update-jenis-pembayaran";
import HapusTipePembayaran from "./_components/hapus-jenis-pembayaran";

const PageTipePembayaran = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "nama",
			header: "Jenis Pembayaran",
			cell: ({ row }) => <div className="">{row.getValue("nama")}</div>,
		},
		{
			accessorKey: "deskripsi",
			header: "Deskripsi",
			cell: ({ row }) => (
				<div className="w-[600px] overflow-x-auto">
					{row.getValue("deskripsi")}
				</div>
			),
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const { id } = row.original;
				const rowData = row.original;
				return (
					<div className="flex items-center gap-2">
						<UpdateTipePembayaran
							onSuccess={fetchData}
							id={id}
							rowData={rowData}
						/>
						<HapusTipePembayaran id={id} onSuccess={fetchData} />
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
				`${process.env.NEXT_PUBLIC_API_URL}/jenis-pembayaran`
			);
			setData(response.data.data);
		} catch (err) {
			console.error("Error fetching data:", err);
			setError("Gagal memuat data");
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
			TambahComponent={<TambahTipePembayaran onSuccess={fetchData} />}
			title="Manajemen Buat Tagihan"
			searchKey="nama"
		/>
	);
};

export default PageTipePembayaran;

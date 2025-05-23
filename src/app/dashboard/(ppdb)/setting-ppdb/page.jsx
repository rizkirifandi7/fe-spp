"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import TambahSettingPPDB from "./components/tambah-ppdb-setting";
import UpdateSettingPPDB from "./components/update-ppdb-setting";
import HapusSettingPPDB from "./components/hapus-ppdb-setting";

const PageSettingPPDB = () => {
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
			accessorKey: "tahun_ajaran",
			header: "Tahun Ajaran",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.getValue("tahun_ajaran")}</div>
			),
		},
		{
			accessorKey: "jumlah_pembayaran",
			header: "Jumlah Pembayaran",
			cell: ({ row }) => {
				const amount = row.getValue("jumlah_pembayaran");
				// Format as IDR currency
				const formatted = new Intl.NumberFormat("id-ID", {
					style: "currency",
					currency: "IDR",
					minimumFractionDigits: 0,
				}).format(amount);

				return <div className="w-[200px] overflow-x-auto">{formatted}</div>;
			},
		},
		{
			accessorKey: "target_siswa",
			header: "Target Siswa",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{row.getValue("target_siswa")}
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
						<UpdateSettingPPDB
							onSuccess={fetchData}
							id={id}
							rowData={rowData}
						/>
						<HapusSettingPPDB id={id} onSuccess={fetchData} />
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
				`${process.env.NEXT_PUBLIC_API_URL}/ppdb-pembayaran`
			);
			setData(response.data.data);
		} catch (err) {
			console.error("Error fetching unit data:", err);
			setError("Gagal memuat data unit");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div className="">
			<TableView
				columns={columns}
				data={data}
				isLoading={isLoading}
				error={error}
				TambahComponent={<TambahSettingPPDB onSuccess={fetchData} />}
				title="Dashboard PPDB Setting"
				searchKey="tahun_ajaran"
			/>
		</div>
	);
};

export default PageSettingPPDB;

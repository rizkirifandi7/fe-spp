"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import TambahUnit from "./_components/tambah-unit";
import HapusUnit from "./_components/hapus-unit";
import UpdateUnit from "./_components/update-unit";

const UnitPage = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "nama_unit",
			header: "Nama Unit",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">
					{row.getValue("nama_unit")}
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
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const { id } = row.original;
				const rowData = row.original;
				return (
					<div className="flex items-center gap-2">
						<UpdateUnit onSuccess={fetchDataUnit} id={id} rowData={rowData} />
						<HapusUnit id={id} onSuccess={fetchDataUnit} />
					</div>
				);
			},
		},
	];

	const fetchDataUnit = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/unit`
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
		fetchDataUnit();
	}, [fetchDataUnit]);

	return (
		<TableView
			columns={columns}
			data={data}
			isLoading={isLoading}
			error={error}
			TambahComponent={<TambahUnit onSuccess={fetchDataUnit} />}
			title="Manajemen Unit"
			searchKey="nama_unit"
		/>
	);
};

export default UnitPage;

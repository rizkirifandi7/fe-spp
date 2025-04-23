"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import TambahRole from "./components/tambah-role";
import UpdateRole from "./components/update-role";
import HapusRole from "./components/hapus-role";

const PageRole = () => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "id",
			header: "ID",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.getValue("id")}</div>
			),
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => (
				<div className="w-[200px] overflow-x-auto">{row.getValue("role")}</div>
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
						<UpdateRole onSuccess={fetchDataRole} id={id} rowData={rowData} />
						<HapusRole id={id} onSuccess={fetchDataRole} />
					</div>
				);
			},
		},
	];

	const fetchDataRole = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/role`
			);
			setData(response.data.data);
		} catch (err) {
			console.error("Error fetching role data:", err);
			setError("Gagal memuat data role");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDataRole();
	}, [fetchDataRole]);

	return (
		<TableView
			columns={columns}
			data={data}
			isLoading={isLoading}
			error={error}
			TambahComponent={<TambahRole onSuccess={fetchDataRole} />}
			title="Manajemen Role"
			searchKey="role"
		/>
	);
};

export default PageRole;

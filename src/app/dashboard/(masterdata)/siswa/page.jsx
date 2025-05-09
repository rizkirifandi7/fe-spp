"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import TambahSiswa from "./_components/tambah-siswa";
import HapusSiswa from "./_components/hapus-siswa";
import UpdateSiswa from "./_components/update-siswa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const PageSiswa = () => {
	const router = useRouter();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const columns = [
		{
			accessorKey: "nisn",
			header: "NISN",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.original?.akun_siswa?.nisn}</div>
			),
		},
		{
			accessorKey: "nama",
			header: "Nama",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.getValue("nama")}</div>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => (
				<div className="overflow-x-auto">{row.getValue("email")}</div>
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
			accessorKey: "unit",
			header: "Unit",
			cell: ({ row }) => (
				<div className="overflow-x-auto">
					{row.original?.akun_siswa?.unit?.nama_unit}
				</div>
			),
		},
		{
			accessorKey: "kelas",
			header: "Kelas",
			cell: ({ row }) => (
				<div className="overflow-x-auto">
					{row.original?.akun_siswa?.kelas?.nama_kelas}
				</div>
			),
		},
		{
			accessorKey: "jurusan",
			header: "Jurusan",
			cell: ({ row }) => (
				<div className="overflow-x-auto">
					{row.original?.akun_siswa?.jurusan?.nama_jurusan}
				</div>
			),
		},
		{
			accessorKey: "tgl_lahir",
			header: "Tanggal Lahir",
			cell: ({ row }) => {
				const dateValue = row.original?.akun_siswa?.tgl_lahir;
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
			accessorKey: "gambar",
			header: "Foto",
			cell: ({ row }) => (
				<div className=" overflow-x-auto">{row.getValue("gambar")}</div>
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
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className={"cursor-pointer"}
										onClick={() =>
											router.push(`/dashboard/siswa/detail-siswa/${id}`)
										}
									>
										<Eye />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Detail Siswa</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<UpdateSiswa onSuccess={fetchData} id={id} rowData={rowData} />
						<HapusSiswa id={id} onSuccess={fetchData} />
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
				`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa`
			);

			setData(response.data.data);
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
			TambahComponent={<TambahSiswa onSuccess={fetchData} />}
			title="Manajemen Siswa"
			searchKey="nama"
		/>
	);
};

export default PageSiswa;

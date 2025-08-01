// app/dashboard/.../_components/pembayaranColumns.jsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatToIDR } from "@/lib/formatIdr";
import { StatusBadge } from "@/components/status/status-badge";
import HapusPembayaran from "./hapus-pembayaran";
import { RiwayatBayarDialog } from "./riwayat-bayar-dialog";

export const getPembayaranColumns = (onRefresh) => [
	{
		accessorKey: "nomor_tagihan",
		header: "Nomor Tagihan",
	},
	{
		accessorKey: "siswa.nama",
		header: "Nama Siswa",
	},
	{
		accessorKey: "siswa.akun_siswa.kelas.nama_kelas",
		header: "Kelas",
	},
	{
		accessorKey: "deskripsi",
		header: "Deskripsi",
	},
	{
		id: "tunggakan",
		header: "Tunggakan",
		cell: ({ row }) => {
			const tunggakan =
				parseFloat(row.original.total_jumlah) -
				parseFloat(row.original.jumlah_bayar);
			return (
				<span className={tunggakan > 0 ? "text-red-600 font-semibold" : ""}>
					{formatToIDR(tunggakan)}
				</span>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Status <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
	},
	{
		id: "riwayat_bayar",
		header: "Riwayat Bayar",
		cell: ({ row }) => <RiwayatBayarDialog bill={row.original} />,
	},
	{
		id: "actions",
		header: "Aksi",
		cell: ({ row }) => (
			<div className="flex items-center space-x-2">
				{row.original.status?.toLowerCase() !== "paid" && (
					<Button
						asChild
						size="sm"
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						<Link href={`/dashboard/pembayaran/${row.original.id}`}>Bayar</Link>
					</Button>
				)}
				<HapusPembayaran id={row.original.id} onSuccess={onRefresh} />
			</div>
		),
	},
];

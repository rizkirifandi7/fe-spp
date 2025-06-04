"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import UpdatePPDB from "./update-ppdb-daftar";
import HapusPPDB from "./hapus-ppdb-daftar";
import TambahPPDB from "./tambah-ppdb-daftar";
import TableView from "@/components/data-table/table-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";

const TableDaftarPPDB = ({ onDataAdded }) => {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isRenewingLink, setIsRenewingLink] = useState(false);
	const [renewingItemId, setRenewingItemId] = useState(null);
	const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
	const [sendingItemId, setSendingItemId] = useState(null);

	const handleRenewLink = async (id) => {
		setRenewingItemId(id);
		setIsRenewingLink(true);
		toast.info("Memperbarui link pembayaran...");

		try {
			const response = await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/daftar-ppdb/midtrans-link/${id}`
			);

			// Periksa apakah respons API menunjukkan keberhasilan
			if (!response.data) {
				throw new Error(response.data.message || "Gagal memperbarui link.");
			}

			toast.success("Link pembayaran berhasil diperbarui.");
			fetchData(); // Refresh data setelah link diperbarui
		} catch (error) {
			console.error("Error renewing payment link:", error);
			toast.error(`Gagal memperbarui link: ${error.message}`);
		} finally {
			setIsRenewingLink(false);
			setRenewingItemId(null);
		}
	};

	const handleSendWhatsApp = async (rowData) => {
		if (!rowData.telepon) {
			toast.error("Nomor telepon tidak ditemukan.");
			return;
		}

		setSendingItemId(rowData.id);
		setIsSendingWhatsApp(true);
		toast.info("Mengirim pesan WhatsApp...");

		const pesan = `
Assalamu’alaikum Warahmatullahi Wabarakatuh

Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${rowData.nama}*
Kelas: *${rowData.kelas || "N/A"} ${
			rowData.jurusan ? `- ${rowData.jurusan}` : ""
		}*

Kami informasikan bahwa terdapat tagihan yang perlu segera diselesaikan. Berikut adalah rincian tagihan:

🧾 Deskripsi: *${"Tagihan Pendaftaran PPDB"}*
💰 Jumlah Tagihan: *${rowData?.ppdb_pembayaran.jumlah_pembayaran || "N/A"}*

Status tagihan saat ini: *BELUM LUNAS*.

Silakan segera lakukan pembayaran melalui link berikut:
${rowData.midtrans_url || "Link tidak tersedia"}

Anda dapat melakukan pembayaran melalui berbagai metode yang tersedia di halaman pembayaran (contoh: Virtual Account Bank, QRIS, E-Wallet, Gerai Retail).

Mohon abaikan pesan ini jika Anda telah melakukan pembayaran.
Terima kasih atas perhatian dan kerjasamanya. Semoga Allah SWT senantiasa memberikan kesehatan dan keberkahan.

Hormat kami,
Tim Keuangan Sekolah
`.trim();

		const targetTelepon = rowData.telepon.startsWith("0")
			? `62${rowData.telepon.substring(1)}`
			: rowData.telepon;

		try {
			const formData = new FormData();
			formData.append("target", targetTelepon);
			formData.append("message", pesan);
			formData.append("schedule", "0");
			formData.append("delay", "2");
			formData.append("countryCode", "62");

			const response = await fetch("https://api.fonnte.com/send", {
				method: "POST",
				headers: { Authorization: process.env.NEXT_PUBLIC_TOKEN_FONNTE },
				body: formData,
			});

			const result = await response.json();
			if (!response.ok || result.status === false) {
				throw new Error(result.reason || "Gagal mengirim pesan WhatsApp.");
			}

			toast.success("Pesan WhatsApp berhasil dikirim.");
		} catch (error) {
			console.error("Error sending WhatsApp:", error);
			toast.error(`Gagal mengirim pesan: ${error.message}`);
		} finally {
			setIsSendingWhatsApp(false);
			setSendingItemId(null);
		}
	};

	const columns = [
		{
			accessorKey: "no_daftar",
			header: "No Daftar",
			cell: ({ row }) => <div className="">{row.getValue("no_daftar")}</div>,
		},

		{
			accessorKey: "nik",
			header: "NIK",
			cell: ({ row }) => <div className="">{row.getValue("nik")}</div>,
		},
		{
			accessorKey: "nama",
			header: "Nama",
			cell: ({ row }) => <div className="">{row.getValue("nama")}</div>,
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => <div className="">{row.getValue("email")}</div>,
		},
		{
			accessorKey: "id_ppdb",
			header: "Unit",
			cell: ({ row }) => (
				<div className=" ">
					{row.original?.ppdb_pembayaran?.unit?.nama_unit}
				</div>
			),
		},
		{
			accessorKey: "telepon",
			header: "Telepon",
			cell: ({ row }) => <div className="">{row.getValue("telepon")}</div>,
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
			accessorKey: "status_pembayaran",
			header: "Status Pembayaran",
			cell: ({ row }) => {
				const originalStatus = row.getValue("status_pembayaran");

				if (!originalStatus) return <div>-</div>;

				const isPaid = originalStatus === "paid";
				const displayStatus = isPaid ? "Lunas" : "Belum Lunas";

				const badgeClass = isPaid
					? "bg-green-100 text-green-800 border-green-300"
					: "bg-red-100 text-red-800 border-red-300";

				return (
					<Badge
						className={`overflow-x-auto capitalize font-medium border px-2 py-0.5 rounded-sm text-center w-fit ${badgeClass}`}
					>
						{displayStatus}
					</Badge>
				);
			},
		},
		// ...existing code...
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status");

				// Define color schemes for each status
				const statusStyles = {
					terdaftar: "bg-blue-100 text-blue-800 border-blue-300",
					pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
					ditolak: "bg-red-100 text-red-800 border-red-300",
					diterima: "bg-green-100 text-green-800 border-green-300",
					verifikasi: "bg-purple-100 text-purple-800 border-purple-300",
				};

				// Map English status to Indonesian status for display and style lookup
				const statusMap = {
					registered: "terdaftar",
					pending: "pending",
					rejected: "ditolak",
					accepted: "diterima",
					verification: "verifikasi",
				};

				const indonesianStatus = statusMap[status?.toLowerCase()] || status; // Fallback to original status if not found

				const statusClass =
					statusStyles[indonesianStatus] || // Use Indonesian status for style lookup
					"bg-gray-100 text-gray-800 border-gray-300";

				return (
					<Badge
						className={`overflow-x-auto capitalize border px-2 py-0.5 font-medium rounded-sm text-center w-fit ${statusClass}`}
					>
						{indonesianStatus} {/* Display Indonesian status */}
					</Badge>
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
						<UpdatePPDB
							onSuccess={fetchData}
							id={id}
							rowData={rowData}
							onDataAdded={onDataAdded}
						/>
						<HapusPPDB
							id={id}
							onSuccess={fetchData}
							onDataAdded={onDataAdded}
						/>
						<Button
							variant="outline"
							onClick={() => handleRenewLink(id)}
							disabled={isRenewingLink && renewingItemId === id}
							className="flex items-center gap-1"
						>
							<RefreshCw className="w-4 h-4" />
							{isRenewingLink && renewingItemId === id
								? "Memperbarui..."
								: "Link"}
						</Button>
						<Button
							variant="outline"
							onClick={() => handleSendWhatsApp(rowData)}
							disabled={isSendingWhatsApp && sendingItemId === id}
							className="flex items-center gap-1"
						>
							<Send className="w-4 h-4" />
							{isSendingWhatsApp && sendingItemId === id
								? "Mengirim..."
								: "Kirim"}
						</Button>
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
				`${process.env.NEXT_PUBLIC_API_URL}/daftar-ppdb`
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
		<div className="w-full max-w-[1560px] mx-auto">
			<TableView
				columns={columns}
				data={data}
				isLoading={isLoading}
				error={error}
				TambahComponent={
					<TambahPPDB onSuccess={fetchData} onDataAdded={onDataAdded} />
				}
				title="Data Pendaftar PPDB"
				searchKey="nama"
			/>
		</div>
	);
};

export default TableDaftarPPDB;

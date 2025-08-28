// src/components/modals/RincianItemModal.jsx

import React, { useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ListOrdered, RefreshCw, Send, X } from "lucide-react";
import {
	formatToIDRLocal,
	formatDateLocal,
	monthNames,
} from "@/lib/formatters";
import { StatusBadge } from "@/components/status/status-badge";

export const RincianItemModal = ({
	isOpen,
	onClose,
	tagihan,
	onTagihanUpdate,
}) => {
	const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
	const [sendingItemId, setSendingItemId] = useState(null);
	const [isRenewingLink, setIsRenewingLink] = useState(false);
	const [renewingItemId, setRenewingItemId] = useState(null);

	if (!isOpen || !tagihan) return null;

	const handleSendWhatsApp = async (item) => {
		if (!tagihan.siswa?.telepon) {
			toast.error("Nomor telepon siswa tidak ditemukan.");
			return;
		}
		if (!item.midtrans_url) {
			toast.error("Link pembayaran tidak ditemukan untuk item ini.");
			return;
		}

		setSendingItemId(item.id);
		setIsSendingWhatsApp(true);
		toast.info(`Mengirim notifikasi WhatsApp untuk ${item.deskripsi}...`);

		const pesan = `
Assalamu’alaikum Warahmatullahi Wabarakatuh
Yth. Wali dari Siswa *${tagihan.siswa.nama}*
Kelas: *${tagihan.siswa.akun_siswa.kelas.nama_kelas} - ${
			tagihan.siswa.akun_siswa.jurusan.nama_jurusan
		}*

Kami informasikan bahwa terdapat tagihan:
🧾 Deskripsi: *${item.deskripsi}*
💰 Jumlah: *${formatToIDRLocal(item.jumlah)}*
📅 Tanggal Terbit: *${formatDateLocal(item.createdAt)}*
🗓️ Jatuh Tempo: *${formatDateLocal(item.jatuh_tempo)}*

Status tagihan saat ini: *BELUM LUNAS*.
Silakan segera lakukan pembayaran melalui link berikut:
${item.midtrans_url}

Terima kasih atas perhatiannya.
Hormat kami,
Staf TU, MA Daarul Ulum.`.trim();

		const targetTelepon = tagihan.siswa.telepon.startsWith("0")
			? `62${tagihan.siswa.telepon.substring(1)}`
			: tagihan.siswa.telepon;

		const formData = new FormData();
		formData.append("target", targetTelepon);
		formData.append("message", pesan);

		try {
			const response = await fetch("https://api.fonnte.com/send", {
				method: "POST",
				headers: { Authorization: process.env.NEXT_PUBLIC_TOKEN_FONNTE },
				body: formData,
			});
			const result = await response.json();
			if (!response.ok || result.status === false) {
				throw new Error(result.reason || "Gagal mengirim pesan.");
			}
			toast.success(`Notifikasi untuk ${item.deskripsi} berhasil dikirim.`);
		} catch (error) {
			toast.error(`Gagal mengirim notifikasi: ${error.message}`);
		} finally {
			setIsSendingWhatsApp(false);
			setSendingItemId(null);
		}
	};

	const handleRenewLink = async (itemToRenew) => {
		setRenewingItemId(itemToRenew.id);
		setIsRenewingLink(true);
		toast.info(`Memperbarui link untuk ${itemToRenew.deskripsi}...`);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/tagihan/item-tagihan/${itemToRenew.id}/renew-link`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
				}
			);
			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || "Gagal memperbarui link.");
			}

			toast.success(`Link untuk ${itemToRenew.deskripsi} berhasil diperbarui.`);

			// Mengkomunikasikan data yang diperbarui kembali ke parent
			const updatedTagihan = {
				...tagihan,
				item_tagihan: tagihan.item_tagihan.map((item) =>
					item.id === itemToRenew.id ? { ...item, ...result.data } : item
				),
			};
			onTagihanUpdate(updatedTagihan);
		} catch (error) {
			toast.error(`Gagal memperbarui link: ${error.message}`);
		} finally {
			setIsRenewingLink(false);
			setRenewingItemId(null);
		}
	};

	return (
		<div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-3xl rounded-xl max-h-[90vh] flex flex-col">
				<CardHeader className="border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="flex items-center gap-3">
							<ListOrdered className="text-blue-600" />
							Rincian Item Tagihan
						</CardTitle>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-5 w-5" />
						</Button>
					</div>
					<CardDescription className="font-mono pt-1">
						{tagihan.nomor_tagihan}
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0 overflow-y-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Deskripsi</TableHead>
								<TableHead>Jatuh Tempo</TableHead>
								<TableHead className="text-right">Jumlah</TableHead>
								<TableHead className="text-center">Status</TableHead>
								<TableHead className="text-center">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tagihan.item_tagihan.map((item) => (
								<TableRow key={item.id}>
									<TableCell>
										{item.deskripsi}
										{item.bulan && item.tahun && (
											<span className="block text-slate-500 text-xs">
												({monthNames[item.bulan - 1]} {item.tahun})
											</span>
										)}
									</TableCell>
									<TableCell>{formatDateLocal(item.jatuh_tempo)}</TableCell>
									<TableCell className="text-right font-medium">
										{formatToIDRLocal(item.jumlah)}
									</TableCell>
									<TableCell className="text-center">
										<StatusBadge status={item.status} />
									</TableCell>
									<TableCell className="text-center space-x-1.5">
										{item.status !== "paid" && (
											<>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleSendWhatsApp(item)}
													disabled={
														isSendingWhatsApp && sendingItemId === item.id
													}
													title="Kirim Notifikasi WhatsApp"
												>
													{isSendingWhatsApp && sendingItemId === item.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Send className="h-4 w-4" />
													)}
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleRenewLink(item)}
													disabled={
														isRenewingLink && renewingItemId === item.id
													}
													title="Perbarui Link Pembayaran"
												>
													{isRenewingLink && renewingItemId === item.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<RefreshCw className="h-4 w-4" />
													)}
												</Button>
											</>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
				<CardFooter className="border-t pt-4">
					<Button onClick={onClose} className="w-full sm:w-auto ml-auto">
						Tutup
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

RincianItemModal.displayName = "RincianItemModal";

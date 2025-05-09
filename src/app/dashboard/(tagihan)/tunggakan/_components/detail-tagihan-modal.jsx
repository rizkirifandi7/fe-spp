import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatToIDR } from "@/lib/formatIdr";
import { StatusBadge } from "@/components/status/status-badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

export const DetailTagihanModal = ({ isOpen, onClose, tagihan }) => {
	if (!tagihan) return null;

	const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
	const [sendingItemId, setSendingItemId] = useState(null);

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatDateTime = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString("id-ID", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const itemTagihanBelumLunas = tagihan.item_tagihan.filter(
		(item) => item.status !== "paid" && item.status !== "lunas" // Anggap 'lunas' juga sebagai status sudah bayar
	);

	const handleSendWhatsApp = async (item) => {
		if (!tagihan.siswa || !tagihan.siswa.telepon) {
			toast.error("Nomor telepon siswa tidak ditemukan.");
			return;
		}
		if (!item.midtrans_url) {
			toast.error(
				"Link pembayaran (Midtrans URL) tidak ditemukan untuk item ini."
			);
			return;
		}

		setSendingItemId(item.id);
		setIsSendingWhatsApp(true);
		toast.info(`Mengirim notifikasi WhatsApp untuk ${item.deskripsi}...`);

		const namaSiswa = tagihan.siswa.nama;
		const kelasSiswa = tagihan.siswa.akun_siswa.kelas.nama_kelas;
		const jurusanSiswa = tagihan.siswa.akun_siswa.jurusan.nama_jurusan;
		const deskripsiTagihan = item.deskripsi; // Anda mungkin perlu menyesuaikan ini jika deskripsinya kurang spesifik
		const jumlahTagihan = formatToIDR(parseFloat(item.jumlah));
		const linkPembayaran = item.midtrans_url;
		const jatuhTempo = item.jatuh_tempo
			? formatDate(item.jatuh_tempo)
			: "segera";

		// Membuat pesan yang lebih menarik
		const pesan = `
Assalamu’alaikum Warahmatullahi Wabarakatuh

Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${namaSiswa}*
Kelas: *${kelasSiswa} - ${jurusanSiswa}*

Kami informasikan bahwa terdapat tagihan:
🧾 Deskripsi: *${deskripsiTagihan}*
💰 Jumlah: *${jumlahTagihan}*
🗓️ Jatuh Tempo: *${jatuhTempo}*

Status tagihan saat ini: BELUM LUNAS.

Silakan segera lakukan pembayaran melalui link berikut:
${linkPembayaran}

Anda dapat melakukan pembayaran melalui berbagai metode yang tersedia di halaman pembayaran (Contoh: Virtual Account Bank, QRIS, E-Wallet, Gerai Retail).

Mohon abaikan pesan ini jika Anda telah melakukan pembayaran.
Terima kasih atas perhatian dan kerjasamanya. Semoga Allah SWT senantiasa memberikan kesehatan dan kesuksesan.

Hormat kami,
Tim Keuangan Sekolah
        `.trim();

		const targetTelepon = tagihan.siswa.telepon.startsWith("0")
			? `62${tagihan.siswa.telepon.substring(1)}`
			: tagihan.siswa.telepon;

		const formData = new FormData();
		formData.append("target", targetTelepon);
		formData.append("message", pesan);
		formData.append("schedule", "0");
		formData.append("delay", "2");
		formData.append("countryCode", "62"); // Pastikan kode negara sesuai

		try {
			const response = await fetch("https://api.fonnte.com/send", {
				method: "POST",
				headers: {
					Authorization: "QqrpmALC8wz9WvyeqtBF", // Ganti dengan API Key Fonnte Anda
				},
				body: formData,
			});

			const result = await response.json();
			if (!response.ok || (result.status === false && result.reason)) {
				throw new Error(
					result?.reason || result?.message || "Gagal mengirim pesan WhatsApp."
				);
			}
			toast.success(
				`Notifikasi WhatsApp untuk ${item.deskripsi} berhasil dikirim.`
			);
		} catch (error) {
			console.error("Error sending WhatsApp:", error);
			toast.error(`Gagal mengirim notifikasi: ${error.message}`);
		} finally {
			setIsSendingWhatsApp(false);
			setSendingItemId(null);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-3xl w-full max-h-[90vh] dark:bg-slate-800 dark:border-green-700">
				<DialogHeader>
					<DialogTitle className="text-slate-800 dark:text-green-100">
						Detail Tagihan: {tagihan.nomor_tagihan}
					</DialogTitle>
					<DialogDescription className="dark:text-slate-400">
						Rincian lengkap tagihan siswa.
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-[calc(80vh-150px)] pr-6">
					<div className="space-y-6 py-4">
						{/* Informasi Siswa */}
						<section>
							<h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-green-200">
								Informasi Siswa
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg dark:border-green-700/50 bg-slate-50 dark:bg-slate-700/30">
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Nama Siswa
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.siswa.nama}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Email
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.siswa.email}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Telepon
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.siswa.telepon || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Kelas
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.siswa.akun_siswa.kelas.nama_kelas} -{" "}
										{tagihan.siswa.akun_siswa.jurusan.nama_jurusan}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										NISN
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.siswa.akun_siswa.nisn}
									</p>
								</div>
							</div>
						</section>

						<Separator className="dark:bg-green-700/50" />

						{/* Detail Tagihan Utama */}
						<section>
							<h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-green-200">
								Detail Tagihan
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg dark:border-green-700/50 bg-slate-50 dark:bg-slate-700/30">
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Nomor Tagihan
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.nomor_tagihan}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Deskripsi
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.deskripsi}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Total Tagihan
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{formatToIDR(parseFloat(tagihan.total_jumlah))}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Jumlah Bayar
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{formatToIDR(parseFloat(tagihan.jumlah_bayar))}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Status
									</p>
									<StatusBadge status={tagihan.status} />
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Jenis Pembayaran
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{tagihan.jenis_pembayaran.nama}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Tanggal Dibuat
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{formatDateTime(tagihan.createdAt)}
									</p>
								</div>
								<div>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Tanggal Diperbarui
									</p>
									<p className="font-medium text-slate-800 dark:text-green-100">
										{formatDateTime(tagihan.updatedAt)}
									</p>
								</div>
							</div>
						</section>

						<Separator className="dark:bg-green-700/50" />

						{/* Item Tagihan Belum Lunas */}
						{itemTagihanBelumLunas.length > 0 && (
							<section>
								<h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-orange-400">
									Item Tagihan Belum Lunas ({itemTagihanBelumLunas.length})
								</h3>
								<div className="border rounded-lg overflow-hidden dark:border-orange-700/50">
									<Table>
										<TableHeader className="bg-slate-50 dark:bg-slate-700/30">
											<TableRow className="dark:border-orange-700/50">
												<TableHead className="text-slate-600 dark:text-orange-300">
													Deskripsi
												</TableHead>
												<TableHead className="text-slate-600 dark:text-orange-300">
													Jumlah
												</TableHead>
												<TableHead className="text-slate-600 dark:text-orange-300">
													Jatuh Tempo
												</TableHead>
												<TableHead className="text-slate-600 dark:text-orange-300">
													Status
												</TableHead>
												<TableHead className="text-slate-600 dark:text-orange-300 text-right">
													Aksi
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody className="dark:divide-orange-700/50">
											{itemTagihanBelumLunas.map((item) => (
												<TableRow
													key={`unpaid-${item.id}`}
													className="dark:border-orange-700/50"
												>
													<TableCell className="text-slate-800 dark:text-green-100">
														{item.deskripsi}
													</TableCell>
													<TableCell className="text-slate-800 dark:text-green-100">
														{formatToIDR(parseFloat(item.jumlah))}
													</TableCell>
													<TableCell className="text-slate-800 dark:text-green-100">
														{formatDate(item.jatuh_tempo)}
													</TableCell>
													<TableCell>
														<StatusBadge status={item.status} />
													</TableCell>
													<TableCell className="text-right">
														{item.midtrans_url && (
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleSendWhatsApp(item)}
																disabled={
																	isSendingWhatsApp && sendingItemId === item.id
																}
																className="dark:text-sky-400 dark:border-sky-600 dark:hover:bg-sky-700/30 gap-1"
															>
																{isSendingWhatsApp &&
																sendingItemId === item.id ? (
																	<Loader2 className="h-4 w-4 animate-spin" />
																) : (
																	<Send className="h-4 w-4" />
																)}
																Kirim WA
															</Button>
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</section>
						)}
						{itemTagihanBelumLunas.length > 0 && (
							<Separator className="dark:bg-green-700/50" />
						)}

						{/* Item Tagihan Keseluruhan */}
						<section>
							<h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-green-200">
								Semua Item Tagihan ({tagihan.item_tagihan.length})
							</h3>
							{tagihan.item_tagihan.length > 0 ? (
								<div className="border rounded-lg overflow-hidden dark:border-green-700/50">
									<Table>
										<TableHeader className="bg-slate-50 dark:bg-slate-700/30">
											<TableRow className="dark:border-green-700/50">
												<TableHead className="text-slate-600 dark:text-green-300">
													Deskripsi
												</TableHead>
												<TableHead className="text-slate-600 dark:text-green-300">
													Jumlah
												</TableHead>
												<TableHead className="text-slate-600 dark:text-green-300">
													Jatuh Tempo
												</TableHead>
												<TableHead className="text-slate-600 dark:text-green-300">
													Status
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody className="dark:divide-green-700/50">
											{tagihan.item_tagihan.map((item) => (
												<TableRow
													key={item.id}
													className="dark:border-green-700/50"
												>
													<TableCell className="text-slate-800 dark:text-green-100">
														{item.deskripsi}
													</TableCell>
													<TableCell className="text-slate-800 dark:text-green-100">
														{formatToIDR(parseFloat(item.jumlah))}
													</TableCell>
													<TableCell className="text-slate-800 dark:text-green-100">
														{formatDate(item.jatuh_tempo)}
													</TableCell>
													<TableCell>
														<StatusBadge status={item.status} />
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							) : (
								<p className="text-slate-500 dark:text-slate-400">
									Tidak ada item tagihan.
								</p>
							)}
						</section>

						<Separator className="dark:bg-green-700/50" />
					</div>
				</ScrollArea>
				<DialogFooter className="sm:justify-end">
					<DialogClose asChild>
						<Button
							type="button"
							variant="outline"
							className="dark:text-green-400 dark:border-green-600 dark:hover:bg-green-700/30"
						>
							Tutup
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

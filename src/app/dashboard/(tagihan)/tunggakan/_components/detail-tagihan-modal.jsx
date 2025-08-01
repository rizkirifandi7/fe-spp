// src/components/modals/DetailTagihanModal.jsx

import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	CheckCircle2,
	DollarSign,
	FileText,
	History,
	ReceiptText,
	Users,
	X,
} from "lucide-react";
import { formatToIDRLocal, formatDateLocal } from "@/lib/formatters";
import { StatusBadge } from "@/components/status/status-badge";

// Sub-komponen untuk menampilkan detail dengan rapi
const DetailItem = ({ icon: Icon, label, value, children }) => (
	<div>
		<div className="flex items-center text-sm text-slate-500 gap-2">
			<Icon className="h-4 w-4" />
			<span>{label}</span>
		</div>
		<div className="font-semibold text-base mt-1 text-slate-800 dark:text-slate-100">
			{value || children}
		</div>
	</div>
);

export const DetailTagihanModal = ({ isOpen, onClose, tagihan }) => {
	if (!isOpen || !tagihan) return null;

	const sisaTagihan =
		parseFloat(tagihan.total_jumlah) - parseFloat(tagihan.jumlah_bayar);

	return (
		<div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-2xl rounded-xl max-h-[90vh] flex flex-col">
				<CardHeader className="border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="flex items-center gap-3">
							<ReceiptText className="text-emerald-600" />
							Detail Tagihan
						</CardTitle>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-5 w-5" />
						</Button>
					</div>
					<CardDescription className="font-mono pt-1">
						{tagihan.nomor_tagihan}
					</CardDescription>
				</CardHeader>
				<CardContent className="p-6 space-y-6 overflow-y-auto">
					{/* Informasi Siswa */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<DetailItem
							icon={Users}
							label="Siswa"
							value={tagihan.siswa?.nama}
						/>
						<DetailItem
							icon={Users}
							label="Kelas & Jurusan"
							value={`${tagihan.siswa?.akun_siswa?.kelas?.nama_kelas || ""} - ${
								tagihan.siswa?.akun_siswa?.jurusan?.nama_jurusan || ""
							}`}
						/>
					</div>
					<Separator />
					{/* Ringkasan Keuangan */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<DetailItem
							icon={FileText}
							label="Deskripsi"
							value={tagihan.deskripsi}
						/>
						<DetailItem icon={CheckCircle2} label="Status">
							<StatusBadge status={tagihan.status} />
						</DetailItem>
						<DetailItem
							icon={DollarSign}
							label="Total Tagihan"
							value={formatToIDRLocal(tagihan.total_jumlah)}
						/>
						<DetailItem
							icon={DollarSign}
							label="Sisa Tagihan"
							value={formatToIDRLocal(sisaTagihan)}
						/>
					</div>

					{/* Riwayat Pembayaran */}
					{tagihan.pembayaran && tagihan.pembayaran.length > 0 && (
						<>
							<Separator />
							<div>
								<h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
									<History /> Riwayat Pembayaran
								</h3>
								<div className="border rounded-lg p-3 space-y-3">
									{tagihan.pembayaran.map((p) => (
										<div
											key={p.id}
											className="flex justify-between items-center"
										>
											<div>
												<p className="font-semibold">
													{formatToIDRLocal(p.jumlah)}
												</p>
												<p className="text-xs text-slate-500">
													{formatDateLocal(p.createdAt, true)}
												</p>
											</div>
											<StatusBadge
												status={p.sudah_verifikasi == true ? "paid" : "pending"}
											/>
										</div>
									))}
								</div>
							</div>
						</>
					)}
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

DetailTagihanModal.displayName = "DetailTagihanModal";

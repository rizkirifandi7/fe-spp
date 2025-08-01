// app/dashboard/.../_components/RiwayatBayarDialog.jsx
"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatToIDR } from "@/lib/formatIdr";

export const RiwayatBayarDialog = ({ bill }) => {
	if (!bill.pembayaran || bill.pembayaran.length === 0) {
		return <span className="text-xs text-gray-500">Belum ada</span>;
	}
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Lihat ({bill.pembayaran.length})
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>Riwayat Pembayaran: {bill.nomor_tagihan}</DialogTitle>
					<DialogDescription>Siswa: {bill.siswa?.nama}</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[400px] w-full pr-4 mt-2">
					{bill.pembayaran
						.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
						.map((p, index) => (
							<div key={p.id} className="mb-3 p-3 border rounded-md">
								<div className="flex justify-between items-start mb-1">
									<p className="font-semibold text-sm">
										Pembayaran Ke-{bill.pembayaran.length - index}
									</p>
									<Badge
										variant={p.sudah_verifikasi ? "default" : "destructive"}
									>
										{p.sudah_verifikasi ? "Terverifikasi" : "Pending"}
									</Badge>
								</div>
								<p className="text-sm">
									<strong>Tanggal:</strong>{" "}
									{new Date(p.createdAt).toLocaleString("id-ID")}
								</p>
								<p className="text-sm">
									<strong>Jumlah:</strong> {formatToIDR(p.jumlah)}
								</p>
								<p className="text-sm">
									<strong>Metode:</strong>{" "}
									<span className="capitalize">{p.metode_pembayaran}</span>
								</p>
							</div>
						))}
				</ScrollArea>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							Tutup
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

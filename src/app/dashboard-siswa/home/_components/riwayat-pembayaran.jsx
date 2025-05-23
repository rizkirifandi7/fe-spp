import React from "react";
import { formatDate, formatRupiah } from "@/lib/formatIdr";
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
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
	CalendarDays,
	CreditCard,
	History,
	RefreshCw,
	ShieldCheck,
	ArrowUpRight,
} from "lucide-react";

import Link from "next/link";

const RiwayatPembayaran = ({ pembayaranSiswa }) => {
	return (
		<section>
			<Card className="bg-white shadow-sm rounded-xl border border-gray-200/80 overflow-hidden">
				<CardHeader className="border-b border-gray-200 px-6 py-4">
					<CardTitle className="text-xl font-semibold text-gray-900">
						Riwayat Pembayaran
					</CardTitle>
					<CardDescription className="text-gray-600 mt-1">
						5 transaksi pembayaran terakhir Anda.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{pembayaranSiswa.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow className="border-b-0 bg-gray-50 hover:bg-gray-100/50">
									<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider w-[200px] px-6 py-3">
										Tanggal
									</TableHead>
									<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
										Deskripsi
									</TableHead>
									<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
										Jumlah
									</TableHead>
									<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
										Metode
									</TableHead>
									<TableHead className="text-right text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
										Status Verifikasi
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pembayaranSiswa.map((p, index) => (
									<TableRow
										key={p.id}
										className={`border-gray-200 hover:bg-gray-50/70 transition-colors duration-150 ${
											index === pembayaranSiswa.length - 1
												? "border-b-0"
												: "border-b"
										}`}
									>
										<TableCell className="font-medium text-gray-700 px-6 py-4">
											<div className="flex items-center">
												<CalendarDays className="h-4 w-4 mr-2 text-emerald-600 opacity-70" />
												{formatDate(p.tanggal, true)}
											</div>
										</TableCell>
										<TableCell className="text-sm text-gray-700 px-6 py-4">
											{p.deskripsi}
										</TableCell>
										<TableCell className="text-gray-800 font-medium px-6 py-4">
											{formatRupiah(p.jumlah)}
										</TableCell>
										<TableCell className="capitalize text-gray-700 px-6 py-4">
											<div className="flex items-center">
												<CreditCard className="h-4 w-4 mr-2 text-gray-400" />
												{p.metode}
											</div>
										</TableCell>
										<TableCell className="text-right px-6 py-4">
											<Badge
												variant={p.statusVerifikasi ? "success" : "warning"}
												className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center justify-center w-fit ml-auto shadow-sm
                                ${
																	p.statusVerifikasi
																		? "bg-emerald-100 text-emerald-700 border border-emerald-200"
																		: "bg-yellow-100 text-yellow-700 border border-yellow-200"
																}`}
											>
												{p.statusVerifikasi ? (
													<ShieldCheck className="mr-1.5 h-4 w-4" />
												) : (
													<RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
												)}
												{p.statusVerifikasi ? "Terverifikasi" : "Pending"}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-16 text-gray-500">
							<History className="mx-auto h-20 w-20 text-gray-400 mb-4" />
							<p className="text-xl font-medium text-gray-700">
								Belum Ada Transaksi
							</p>
							<p className="text-md mt-1">
								Riwayat pembayaran Anda akan muncul di sini.
							</p>
						</div>
					)}
				</CardContent>
				{pembayaranSiswa.length > 0 && (
					<CardFooter className="flex justify-end py-4 border-t border-gray-200 px-6">
						<Link href={`/dashboard-siswa/tagihan`}>
							<Button
								variant="outline"
								size="sm"
								className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors shadow-sm"
							>
								Lihat Semua Riwayat <ArrowUpRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</CardFooter>
				)}
			</Card>
		</section>
	);
};

export default RiwayatPembayaran;

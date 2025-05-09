// ...existing code...
import React, { useState } from "react"; // Added useState
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatToIDR } from "@/lib/formatIdr";
import { cn } from "@/lib/utils";
import { Pagination } from "./pagination";
import { StatusBadge } from "@/components/status/status-badge";
import { DetailTagihanModal } from "./detail-tagihan-modal";

const TabelTagihan = ({
	filteredData, // Data yang sudah difilter
	currentPage, // Halaman saat ini
	setCurrentPage, // Fungsi untuk mengubah halaman saat ini
	itemsPerPage, // Jumlah item per halaman
	totalPages, // Total halaman
	// router, // Router can be removed if only used for detail navigation previously
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTagihan, setSelectedTagihan] = useState(null);

	const handleOpenDetailModal = (tagihan) => {
		setSelectedTagihan(tagihan);
		setIsModalOpen(true);
	};

	const handleCloseDetailModal = () => {
		setIsModalOpen(false);
		setSelectedTagihan(null);
	};

	return (
		<>
			{" "}
			{/* Added React.Fragment shorthand */}
			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-green-900/50 shadow-sm overflow-hidden">
				{/* ...existing code... */}
				<CardContent>
					{filteredData.length === 0 ? (
						<Alert className="bg-white dark:bg-green-900/20 border-slate-200 dark:border-green-800/50">
							<AlertCircle className="h-4 w-4 text-slate-800 dark:text-green-400" />
							<AlertTitle>Tidak ada data</AlertTitle>
							<AlertDescription>
								Tidak ditemukan tagihan yang sesuai dengan filter Anda.
							</AlertDescription>
						</Alert>
					) : (
						<>
							<div className="rounded-lg border border-slate-200 dark:border-green-900/50 overflow-hidden">
								<Table className="min-w-full">
									<TableHeader className="bg-white dark:bg-green-900/20">
										<TableRow className="border-slate-200 dark:border-green-900/50">
											{[
												"Siswa",
												"Kelas",
												"No. Tagihan",
												"Deskripsi",
												"Tagihan",
												"Sudah Bayar",
												"Status",
												"Aksi",
											].map((h) => (
												<TableHead
													key={h}
													className={cn(
														"text-slate-800 dark:text-green-200 font-semibold",
														h === "Aksi" && "text-right"
													)}
												>
													{h}
												</TableHead>
											))}
										</TableRow>
									</TableHeader>
									<TableBody className="divide-y divide-green-100 dark:divide-green-900/50">
										{filteredData
											.slice(
												(currentPage - 1) * itemsPerPage,
												currentPage * itemsPerPage
											)
											.map((tagihan) => (
												<TableRow
													key={tagihan.id}
													className="hover:bg-white/50 dark:hover:bg-green-900/20"
												>
													<TableCell className="font-medium">
														<div className="flex items-center gap-3">
															<div>
																<div className="text-slate-800 dark:text-green-100 font-medium">
																	{tagihan.siswa.nama}
																</div>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<span className="text-slate-800 dark:text-green-100">
																{tagihan.siswa.akun_siswa.kelas.nama_kelas}-
																{tagihan.siswa.akun_siswa.jurusan.nama_jurusan}
															</span>
														</div>
													</TableCell>
													<TableCell className="text-slate-800 dark:text-green-300 font-mono">
														{tagihan.nomor_tagihan}
													</TableCell>
													<TableCell className="text-slate-800 dark:text-green-300 font-mono">
														{tagihan.deskripsi}
													</TableCell>
													<TableCell className="font-medium text-slate-800 dark:text-green-100">
														{formatToIDR(
															parseFloat(tagihan.total_jumlah) -
																tagihan.jumlah_bayar
														)}
													</TableCell>
													<TableCell className="font-medium text-slate-800 dark:text-green-100">
														{formatToIDR(tagihan.jumlah_bayar)}
													</TableCell>
													<TableCell>
														<StatusBadge status={tagihan.status} />
													</TableCell>
													<TableCell className="text-right">
														<Button
															variant="outline"
															size="sm"
															className="text-slate-800 dark:text-green-400 border-slate-200 dark:border-green-800 hover:bg-white dark:hover:bg-green-900/30"
															onClick={() => handleOpenDetailModal(tagihan)} // Changed onClick
														>
															Detail
														</Button>
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</div>
							{filteredData.length > itemsPerPage && (
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
									onNext={() =>
										setCurrentPage((prev) => Math.min(prev + 1, totalPages))
									}
								/>
							)}
						</>
					)}
				</CardContent>
			</Card>
			{selectedTagihan && ( // Conditionally render the modal
				<DetailTagihanModal
					isOpen={isModalOpen}
					onClose={handleCloseDetailModal}
					tagihan={selectedTagihan}
				/>
			)}
		</>
	);
};

export default TabelTagihan;

// app/dashboard/.../_components/TabelTagihan.jsx
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { formatToIDRLocal } from "@/lib/formatters";
import { DetailTagihanModal } from "./detail-tagihan-modal";
import { RincianItemModal } from "./rincian-item-modal";
import { StatusBadge } from "@/components/status/status-badge";

export default function TabelTagihan({
	data,
	currentPage,
	totalPages,
	setCurrentPage,
	onTagihanUpdate,
}) {
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [isRincianModalOpen, setIsRincianModalOpen] = useState(false);
	const [selectedTagihan, setSelectedTagihan] = useState(null);

	const handleOpenModal = (tagihan, modalType) => {
		setSelectedTagihan(tagihan);
		if (modalType === "detail") setIsDetailModalOpen(true);
		if (modalType === "rincian") setIsRincianModalOpen(true);
	};

	const handleCloseModals = () => {
		setIsDetailModalOpen(false);
		setIsRincianModalOpen(false);
		setSelectedTagihan(null);
	};

	const tableHeaders = [
		"Siswa",
		"Kelas",
		"No. Tagihan",
		"Sisa Tagihan",
		"Status",
		"Aksi",
	];

	return (
		<>
			<Card className="bg-white dark:bg-slate-800/50 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
				<CardContent className="p-0">
					{data.length === 0 ? (
						<div className="p-10 text-center text-slate-500 dark:text-slate-400">
							<AlertCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
							<p className="font-semibold">Tidak ada tagihan ditemukan</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader className="bg-slate-50 dark:bg-slate-800">
									<TableRow>
										{tableHeaders.map((header) => (
											<TableHead
												key={header}
												className={cn(
													"text-slate-600 dark:text-slate-300",
													header === "Aksi" && "text-right"
												)}
											>
												{header}
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.map((item) => (
										<TableRow
											key={item.id}
											className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50"
										>
											<TableCell>{item.siswa?.nama}</TableCell>
											<TableCell>{`${
												item.siswa?.akun_siswa?.kelas?.nama_kelas || ""
											}-${
												item.siswa?.akun_siswa?.jurusan?.nama_jurusan || ""
											}`}</TableCell>
											<TableCell className="font-mono">
												{item.nomor_tagihan}
											</TableCell>
											<TableCell className="font-medium">
												{formatToIDRLocal(
													parseFloat(item.total_jumlah) -
														parseFloat(item.jumlah_bayar)
												)}
											</TableCell>
											<TableCell>
												<StatusBadge status={item.status} />
											</TableCell>
											<TableCell className="text-right space-x-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleOpenModal(item, "rincian")}
												>
													<ListOrdered className="mr-2 h-4 w-4" /> Item
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleOpenModal(item, "detail")}
												>
													<Eye className="mr-2 h-4 w-4" /> Detail
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
				{totalPages > 1 && (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				)}
			</Card>

			<DetailTagihanModal
				isOpen={isDetailModalOpen}
				onClose={handleCloseModals}
				tagihan={selectedTagihan}
			/>
			<RincianItemModal
				isOpen={isRincianModalOpen}
				onClose={handleCloseModals}
				tagihan={selectedTagihan}
				onTagihanUpdate={onTagihanUpdate}
			/>
		</>
	);
}

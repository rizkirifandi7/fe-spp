// app/dashboard/pembayaran/[idTagihan]/page.jsx
"use client";

import { useParams } from "next/navigation";
import { usePembayaran } from "@/hooks/usePembayaran";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiswaInfoCard } from "./_components/siswa-info-card";
import { ItemTagihanTable } from "./_components/item-tagihan-tabel";
import { RingkasanPembayaran } from "./_components/ringkasan-pembayaran";
import { FormPembayaran } from "./_components/form-pembayaran";

export default function PembayaranPage() {
	const { idTagihan } = useParams();
	const {
		isLoading,
		isSubmitting,
		tagihan,
		siswa,
		selectedItems,
		formData,
		totals,
		handleItemSelect,
		handleSelectAll,
		handleInputChange,
		handleSubmit,
		router,
	} = usePembayaran(idTagihan);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<Skeleton className="h-10 w-48 mb-8" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-64 w-full" />
					</div>
					<div className="space-y-6">
						<Skeleton className="h-56 w-full" />
						<Skeleton className="h-64 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (!tagihan || !siswa) {
		return (
			<div className="container mx-auto py-8 text-center">
				<AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
				<h2 className="text-xl font-semibold">Data Tidak Ditemukan</h2>
				<p className="text-slate-500">
					Gagal memuat data tagihan atau siswa. Silakan kembali dan coba lagi.
				</p>
				<Button onClick={() => router.back()} className="mt-4">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Kembali
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex items-center mb-8 gap-4">
				<Button variant="outline" onClick={() => router.back()}>
					<ArrowLeft className="h-5 w-5 mr-2" />
					Kembali
				</Button>
				<h1 className="text-2xl font-bold">Pembayaran Tagihan</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<SiswaInfoCard siswa={siswa} tagihan={tagihan} />
					<ItemTagihanTable
						items={tagihan.item_tagihan}
						selectedItems={selectedItems}
						unpaidItemsCount={totals.unpaidItems.length}
						onItemSelect={handleItemSelect}
						onSelectAll={handleSelectAll}
					/>
				</div>
				<div className="space-y-6">
					<RingkasanPembayaran
						totalUnpaid={totals.totalUnpaid}
						selectedItemsCount={selectedItems.length}
						selectedTotal={totals.selectedTotal}
						paymentAmount={parseFloat(formData.jumlah)}
					/>
					<FormPembayaran
						formData={formData}
						onInputChange={handleInputChange}
						onSubmit={handleSubmit}
						isSubmitting={isSubmitting}
						selectedItemsCount={selectedItems.length}
						selectedTotal={totals.selectedTotal}
					/>
				</div>
			</div>
		</div>
	);
}

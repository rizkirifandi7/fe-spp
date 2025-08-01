// app/dashboard/.../page.jsx
"use client";

import { useMemo } from "react";
import { usePembayaranSiswa } from "@/hooks/usePembayaranSiswa";
import TableView from "@/components/data-table/table-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { FilterPembayaran } from "./_components/filter-pembayaran";
import { getPembayaranColumns } from "./_components/pembayaran-colums";

export default function PageDataPembayaranSiswa() {
	const {
		filteredTagihan,
		isLoading,
		isFetchingAll,
		error,
		hasSearched,
		namaQuery,
		setNamaQuery,
		kelasQuery,
		setKelasQuery,
		jurusanQuery,
		setJurusanQuery,
		uniqueFilterLists,
		handleSearch,
		clearSearch,
		refreshData,
	} = usePembayaranSiswa();

	// Memoize kolom agar tidak dibuat ulang pada setiap render
	const columns = useMemo(
		() => getPembayaranColumns(refreshData),
		[refreshData]
	);

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="flex justify-center items-center py-10">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
					<p className="ml-3 text-muted-foreground">Mencari data...</p>
				</div>
			);
		}
		if (hasSearched && filteredTagihan.length > 0) {
			return (
				<div className="mt-6">
					<h2 className="text-xl font-semibold mb-4">Hasil Pencarian</h2>
					<TableView
						columns={columns}
						data={filteredTagihan}
						searchKey="siswa.nama"
						searchPlaceholder="Cari dalam hasil..."
					/>
				</div>
			);
		}
		if (hasSearched) {
			return (
				<Alert className="mt-6">
					<AlertTitle>Informasi</AlertTitle>
					<AlertDescription>
						Tidak ada data tagihan ditemukan. Coba ubah kriteria pencarian Anda.
					</AlertDescription>
				</Alert>
			);
		}
		return (
			<Alert className="mt-6">
				<AlertTitle>Mulai Mencari</AlertTitle>
				<AlertDescription>
					Gunakan filter di atas dan klik "Cari Tagihan" untuk menampilkan data.
				</AlertDescription>
			</Alert>
		);
	};

	return (
		<div className="space-y-6 p-2 sm:p-4 md:p-6">
			<FilterPembayaran
				namaQuery={namaQuery}
				setNamaQuery={setNamaQuery}
				kelasQuery={kelasQuery}
				setKelasQuery={setKelasQuery}
				jurusanQuery={jurusanQuery}
				setJurusanQuery={setJurusanQuery}
				uniqueFilterLists={uniqueFilterLists}
				handleSearch={handleSearch}
				clearSearch={clearSearch}
				isLoading={isLoading}
				isFetchingAll={isFetchingAll}
				hasSearched={hasSearched}
			/>

			{error && !isLoading && (
				<Alert variant="destructive">
					<AlertTitle>Oops! Terjadi Kesalahan</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{renderContent()}
		</div>
	);
}

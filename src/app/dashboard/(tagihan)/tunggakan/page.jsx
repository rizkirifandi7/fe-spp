// app/dashboard/.../page.jsx
"use client";

import { useRouter } from "next/navigation";
import { useTagihanSiswa } from "@/hooks/useTagihanSiswa";
import {
	Filter,
	ChevronUp,
	ChevronDown,
	ListChecks,
	BadgeCheck,
	BadgeAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CardInfoSiswa from "./_components/card-info-siswa";
import { FilterPencarian } from "./_components/filter-pencarian";
import CardStatistik from "./_components/card-statistik";
import TabelTagihan from "./_components/tabel-tagihan";
import { useState } from "react";

export default function TagihanSiswaPage() {
	const router = useRouter();
	const [showFilters, setShowFilters] = useState(true);

	const {
		isLoading,
		filters,
		handleFilterChange,
		resetFilters,
		siswaList,
		kelasList,
		jurusanList,
		selectedSiswaInfo,
		statistikData,
		paginatedData,
		currentPage,
		totalPages,
		setCurrentPage,
		masterTagihan,
		setMasterTagihan,
	} = useTagihanSiswa();

	// Fungsi ini akan di-pass ke modal untuk mengupdate data di halaman utama
	const handleTagihanUpdate = (updatedTagihan) => {
		const updatedList = masterTagihan.map((t) =>
			t.id === updatedTagihan.id ? updatedTagihan : t
		);
		setMasterTagihan(updatedList);
	};

	if (isLoading) {
		return (
			<div className="p-8">
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	const statistikCards = [
		{
			title: "Total Tagihan",
			value: statistikData.total,
			icon: <ListChecks className="h-5 w-5 text-blue-500" />,
		},
		{
			title: "Tagihan Lunas",
			value: statistikData.lunas,
			icon: <BadgeCheck className="h-5 w-5 text-green-500" />,
		},
		{
			title: "Belum Lunas",
			value: statistikData.belumLunas,
			icon: <BadgeAlert className="h-5 w-5 text-yellow-500" />,
		},
	];

	return (
		<div className="min-h-screen p-4 sm:p-8 space-y-8 dark:bg-slate-900">
			<header>
				<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
					Informasi Tagihan Siswa
				</h1>
				<p className="text-slate-600 dark:text-slate-300">
					Lihat dan kelola tagihan siswa.
				</p>
			</header>

			<Card className="dark:bg-slate-800/50">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" /> Filter Pencarian
					</CardTitle>
					<Button variant="ghost" onClick={() => setShowFilters(!showFilters)}>
						{showFilters ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</Button>
				</CardHeader>
				{showFilters && (
					<FilterPencarian
						filters={filters}
						setFilters={handleFilterChange} // Langsung gunakan handler dari hook
						resetFilters={resetFilters}
						siswaList={siswaList}
						kelasList={kelasList}
						jurusanList={jurusanList}
					/>
				)}
			</Card>

			{selectedSiswaInfo && (
				<CardInfoSiswa selectedSiswaInfo={selectedSiswaInfo} />
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{statistikCards.map((stat, i) => (
					<CardStatistik key={i} stat={stat} />
				))}
			</div>

			<TabelTagihan
				data={paginatedData}
				currentPage={currentPage}
				totalPages={totalPages}
				setCurrentPage={setCurrentPage}
				onTagihanUpdate={handleTagihanUpdate}
			/>
		</div>
	);
}

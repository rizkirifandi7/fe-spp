// src/hooks/usePembayaranSiswa.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

export const usePembayaranSiswa = () => {
	// State untuk data dan UI
	const [allTagihanData, setAllTagihanData] = useState([]);
	const [filteredTagihan, setFilteredTagihan] = useState([]);
	const [isFetchingAll, setIsFetchingAll] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [hasSearched, setHasSearched] = useState(false);

	// State untuk query filter
	const [namaQuery, setNamaQuery] = useState("");
	const [kelasQuery, setKelasQuery] = useState("");
	const [jurusanQuery, setJurusanQuery] = useState("");

	// Memoized lists untuk dropdown filter, agar tidak dihitung ulang setiap render
	const uniqueFilterLists = useMemo(() => {
		const names = new Set();
		const klasses = new Set();
		const jurusans = new Set();
		allTagihanData.forEach((item) => {
			if (item.siswa?.nama) names.add(item.siswa.nama);
			if (item.siswa?.akun_siswa?.kelas?.nama_kelas)
				klasses.add(item.siswa.akun_siswa.kelas.nama_kelas);
			if (item.siswa?.akun_siswa?.jurusan?.nama_jurusan)
				jurusans.add(item.siswa.akun_siswa.jurusan.nama_jurusan);
		});
		return {
			nama: Array.from(names).sort(),
			kelas: Array.from(klasses).sort(),
			jurusan: Array.from(jurusans).sort(),
		};
	}, [allTagihanData]);

	// Fungsi untuk mengambil semua data tagihan
	const fetchAllTagihan = useCallback(async (showLoadingSpinner = true) => {
		if (showLoadingSpinner) setIsFetchingAll(true);
		setError(null);
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/tagihan`
			);
			const data = response.data.data || [];
			setAllTagihanData(data);
			return data;
		} catch (err) {
			setError("Gagal memuat data tagihan. Pastikan API berjalan.");
			return [];
		} finally {
			if (showLoadingSpinner) setIsFetchingAll(false);
		}
	}, []);

	// Effect untuk mengambil data saat komponen pertama kali dimuat
	useEffect(() => {
		fetchAllTagihan();
	}, [fetchAllTagihan]);

	// Fungsi untuk menjalankan pencarian
	const handleSearch = useCallback(() => {
		if (!namaQuery.trim() && !kelasQuery.trim() && !jurusanQuery.trim()) {
			setError("Masukkan setidaknya satu kriteria pencarian.");
			setFilteredTagihan([]);
			setHasSearched(true);
			return;
		}

		setIsLoading(true);
		setError(null);
		setHasSearched(true);

		const filtered = allTagihanData.filter((t) => {
			const namaMatch =
				!namaQuery ||
				t.siswa?.nama?.toLowerCase().includes(namaQuery.toLowerCase());
			const kelasMatch =
				!kelasQuery || t.siswa?.akun_siswa?.kelas?.nama_kelas === kelasQuery;
			const jurusanMatch =
				!jurusanQuery ||
				t.siswa?.akun_siswa?.jurusan?.nama_jurusan === jurusanQuery;
			return namaMatch && kelasMatch && jurusanMatch;
		});

		setFilteredTagihan(filtered);
		if (filtered.length === 0) {
			setError("Tidak ada data tagihan yang cocok dengan kriteria pencarian.");
		}
		setIsLoading(false);
	}, [namaQuery, kelasQuery, jurusanQuery, allTagihanData]);

	// Fungsi untuk membersihkan filter
	const clearSearch = useCallback(() => {
		setNamaQuery("");
		setKelasQuery("");
		setJurusanQuery("");
		setFilteredTagihan([]);
		setError(null);
		setHasSearched(false);
	}, []);

	// Fungsi untuk me-refresh data setelah aksi (misal: hapus)
	const refreshData = async () => {
		setIsLoading(true);
		const updatedData = await fetchAllTagihan(false);

		// Re-apply current filters to the new data
		const filtered = updatedData.filter((t) => {
			const namaMatch =
				!namaQuery ||
				t.siswa?.nama?.toLowerCase().includes(namaQuery.toLowerCase());
			const kelasMatch =
				!kelasQuery || t.siswa?.akun_siswa?.kelas?.nama_kelas === kelasQuery;
			const jurusanMatch =
				!jurusanQuery ||
				t.siswa?.akun_siswa?.jurusan?.nama_jurusan === jurusanQuery;
			return namaMatch && kelasMatch && jurusanMatch;
		});
		setFilteredTagihan(filtered);

		setIsLoading(false);
	};

	return {
		// States
		filteredTagihan,
		isLoading,
		isFetchingAll,
		error,
		hasSearched,
		namaQuery,
		kelasQuery,
		jurusanQuery,
		uniqueFilterLists,
		// Setters
		setNamaQuery,
		setKelasQuery,
		setJurusanQuery,
		// Handlers
		handleSearch,
		clearSearch,
		refreshData,
	};
};

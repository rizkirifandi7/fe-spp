// src/hooks/useTagihanSiswa.js
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getCookie } from "@/actions/cookies";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const useTagihanSiswa = () => {
	// --- STATES ---
	const [isLoading, setIsLoading] = useState(true);
	const [masterTagihan, setMasterTagihan] = useState([]);
	const [siswaList, setSiswaList] = useState([]);
	const [kelasList, setKelasList] = useState([]);
	const [jurusanList, setJurusanList] = useState([]);
	const [filters, setFilters] = useState({
		nama: "",
		kelas: "",
		jurusan: "",
		status: "",
	});
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// --- DATA FETCHING ---
	const fetchData = async () => {
		try {
			setIsLoading(true);
			const token = (await getCookie("token"))?.value;
			const headers = { Authorization: `Bearer ${token}` };

			const responses = await Promise.all([
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/tagihan`, { headers }),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa`, { headers }),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas`, { headers }),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/jurusan`, { headers }),
			]);

			const [tagihanResult, siswaData, kelasData, jurusanData] =
				await Promise.all(responses.map((res) => res.json()));

			if (tagihanResult.success) setMasterTagihan(tagihanResult.data);
			if (siswaData.message === "Data siswa ditemukan")
				setSiswaList(siswaData.data);
			if (kelasData.data) setKelasList(kelasData.data);
			if (jurusanData.data) setJurusanList(jurusanData.data);
		} catch (error) {
			console.error("Fetch data error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// --- DATA PROCESSING (MEMOIZED) ---
	const filteredData = useMemo(() => {
		return masterTagihan.filter((item) => {
			const siswa = item.siswa || {};
			const akunSiswa = siswa.akun_siswa || {};

			const matchNama =
				!filters.nama ||
				siswa.nama?.toLowerCase().includes(filters.nama.toLowerCase());
			const matchKelas =
				!filters.kelas || akunSiswa.id_kelas?.toString() === filters.kelas;
			const matchJurusan =
				!filters.jurusan ||
				akunSiswa.id_jurusan?.toString() === filters.jurusan;

			let matchStatus = true;
			if (filters.status && filters.status !== "all") {
				matchStatus =
					filters.status === "belum_lunas"
						? item.status !== "paid" && item.status !== "pending"
						: item.status === filters.status;
			}
			return matchNama && matchKelas && matchJurusan && matchStatus;
		});
	}, [filters, masterTagihan]);

	const selectedSiswaInfo = useMemo(() => {
		if (!filters.nama) return null;
		const siswa = siswaList.find((s) => s.nama === filters.nama);
		if (!siswa) return null;

		return {
			nama: siswa.nama,
			email: siswa.email || "N/A",
			telepon: siswa.telepon || "N/A",
			alamat: siswa.alamat || "N/A",
			nama_kelas: siswa.akun_siswa?.kelas?.nama_kelas || "N/A",
			nama_jurusan: siswa.akun_siswa?.jurusan?.nama_jurusan || "N/A",
			nisn: siswa.akun_siswa?.nisn || "N/A",
			tgl_lahir: siswa.akun_siswa?.tgl_lahir
				? format(new Date(siswa.akun_siswa.tgl_lahir), "dd MMMM yyyy", {
						locale: id,
				  })
				: "N/A",
		};
	}, [filters.nama, siswaList]);

	const statistikData = useMemo(() => {
		const total = filteredData.length;
		const lunas = filteredData.filter((item) => item.status === "paid").length;
		const belumLunas = total - lunas;
		return { total, lunas, belumLunas };
	}, [filteredData]);

	// --- HANDLERS (WRAPPED IN useCallback) ---
	const handleFilterChange = useCallback((newFilters) => {
		setCurrentPage(1);
		setFilters(newFilters);
	}, []);

	const resetFilters = useCallback(() => {
		setCurrentPage(1);
		setFilters({ nama: "", kelas: "", jurusan: "", status: "" });
	}, []);

	// --- PAGINATION ---
	const totalPages = Math.ceil(filteredData.length / itemsPerPage);
	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredData.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredData, currentPage, itemsPerPage]);

	return {
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
		masterTagihan, // Kirim master data untuk update
		setMasterTagihan, // Kirim setter untuk update
	};
};

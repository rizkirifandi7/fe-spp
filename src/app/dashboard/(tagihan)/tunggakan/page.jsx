"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
	Calendar as CalendarIcon,
	ChevronDown,
	ChevronUp,
	ListChecks,
	BadgeCheck,
	BadgeAlert,
	Plus,
	Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { getCookie } from "@/actions/cookies";
import CardInfoSiswa from "./_components/card-info-siswa";
import { FilterPencarian } from "./_components/filter-pencarian";
import CardStatistik from "./_components/card-statistik";
import TabelTagihan from "./_components/tabel-tagihan";

export default function TagihanSiswaPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [tagihanData, setTagihanData] = useState([]);
	const [siswaList, setSiswaList] = useState([]);
	const [kelasList, setKelasList] = useState([]);
	const [jurusanList, setJurusanList] = useState([]);
	const [openSiswaPopover, setOpenSiswaPopover] = useState(false);
	const [siswaSearchTerm, setSiswaSearchTerm] = useState("");
	const [selectedSiswaInfo, setSelectedSiswaInfo] = useState(null);

	const [filters, setFilters] = useState({
		nama: "",
		kelas: "",
		jurusan: "",
		status: "",
	});
	const [showFilters, setShowFilters] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const token = (await getCookie("token"))?.value;
				const headers = { Authorization: `Bearer ${token}` };

				const tagihanResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/tagihan`,
					{ headers }
				);
				const tagihanResult = await tagihanResponse.json();

				if (tagihanResult.success) setTagihanData(tagihanResult.data);

				const [siswaRes, kelasRes, jurusanRes] = await Promise.all([
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa`, { headers }),
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas`, { headers }),
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/jurusan`, { headers }),
				]);

				const [siswaData, kelasData, jurusanData] = await Promise.all([
					siswaRes.json(),
					kelasRes.json(),
					jurusanRes.json(),
				]);

				if (siswaData.message === "Data siswa ditemukan" && siswaData.data) {
					const formattedSiswaList = siswaData.data.map((siswa) => ({
						...siswa,
						akun_siswa: siswa.akun_siswa || { kelas: {}, jurusan: {} },
						...(siswa.akun_siswa && {
							akun_siswa: {
								...siswa.akun_siswa,
								kelas: siswa.akun_siswa.kelas || {},
								jurusan: siswa.akun_siswa.jurusan || {},
							},
						}),
					}));
					setSiswaList(formattedSiswaList);
				}
				if (kelasData.message && kelasData.data) setKelasList(kelasData.data);
				if (jurusanData.message === "Data ditemukan" && jurusanData.data)
					setJurusanList(jurusanData.data);
			} catch (error) {
				console.error("Fetch data error:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	// Filtered data with useMemo for efficiency
	const filteredData = useMemo(() => {
		let result = tagihanData;
		if (filters.nama)
			result = result.filter((item) =>
				item.siswa.nama.toLowerCase().includes(filters.nama.toLowerCase())
			);
		if (filters.kelas)
			result = result.filter(
				(item) => item.siswa.akun_siswa.id_kelas?.toString() === filters.kelas
			);
		if (filters.jurusan)
			result = result.filter(
				(item) =>
					item.siswa.akun_siswa.id_jurusan?.toString() === filters.jurusan
			);
		if (filters.status) {
			if (filters.status === "belum_lunas") {
				result = result.filter(
					(item) => item.status !== "paid" && item.status !== "pending"
				);
			} else if (filters.status !== "all") {
				result = result.filter((item) => item.status === filters.status);
			}
		}
		return result;
	}, [filters, tagihanData]);

	// Reset page to 1 if filter changes
	useEffect(() => {
		setCurrentPage(1);
	}, [filters]);

	// Siswa info
	useEffect(() => {
		if (filters.nama && siswaList.length > 0) {
			const siswa = siswaList.find((s) => s.nama === filters.nama);
			if (siswa) {
				setSelectedSiswaInfo({
					nama: siswa.nama,
					email: siswa.email || "N/A",
					telepon: siswa.telepon || "N/A",
					alamat: siswa.alamat || "N/A",
					nama_kelas: siswa.akun_siswa?.kelas?.nama_kelas || "N/A",
					nama_jurusan: siswa.akun_siswa?.jurusan?.nama_jurusan || "N/A",
					nisn: siswa.akun_siswa?.nisn || "N/A",
					tempat_lahir: siswa.akun_siswa?.tempat_lahir || "N/A",
					tgl_lahir: siswa.akun_siswa?.tgl_lahir
						? format(new Date(siswa.akun_siswa.tgl_lahir), "dd MMMM yyyy", {
								locale: id,
						  })
						: "N/A",
					umur: siswa.akun_siswa?.umur || "N/A",
					jenis_kelamin: siswa.akun_siswa?.jenis_kelamin || "N/A",
				});
			} else setSelectedSiswaInfo(null);
		} else setSelectedSiswaInfo(null);
	}, [filters.nama, siswaList]);

	const resetFilters = () =>
		setFilters({ nama: "", kelas: "", jurusan: "", status: "" });

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 space-y-6">
				<Skeleton className="h-10 w-3/4 md:w-1/2" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Skeleton className="h-12 w-full rounded-lg" />
					<Skeleton className="h-12 w-full rounded-lg" />
					<Skeleton className="h-12 w-full rounded-lg" />
				</div>
				<Skeleton className="h-72 w-full rounded-xl" />
				<Skeleton className="h-72 w-full rounded-xl mt-6" />
			</div>
		);
	}

	return (
		<div className="min-h-screen  dark:from-slate-900 dark:to-black">
			<div className="container mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
							Informasi Tagihan Siswa
						</h1>
						<p className="text-slate-600 dark:text-slate-300 mt-1">
							Lihat dan kelola tagihan serta tunggakan siswa
						</p>
					</div>
				</div>

				{/* Filter Section */}
				<Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
								<Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
								Filter Pencarian
							</CardTitle>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowFilters(!showFilters)}
								className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
							>
								{showFilters ? (
									<>
										<ChevronUp className="h-4 w-4 mr-1" />
										Sembunyikan
									</>
								) : (
									<>
										<ChevronDown className="h-4 w-4 mr-1" />
										Tampilkan
									</>
								)}
							</Button>
						</div>
					</CardHeader>
					{showFilters && (
						<FilterPencarian
							filters={filters}
							setFilters={setFilters}
							siswaList={siswaList}
							kelasList={kelasList}
							jurusanList={jurusanList}
							setSiswaSearchTerm={setSiswaSearchTerm}
							setOpenSiswaPopover={setOpenSiswaPopover}
							openSiswaPopover={openSiswaPopover}
							setSelectedSiswaInfo={setSelectedSiswaInfo}
							setShowFilters={setShowFilters}
							resetFilters={resetFilters}
							siswaSearchTerm={siswaSearchTerm}
						/>
					)}
				</Card>

				{/* Informasi Siswa Card */}
				{selectedSiswaInfo && (
					<CardInfoSiswa selectedSiswaInfo={selectedSiswaInfo} />
				)}

				{/* Statistik */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[
						{
							title: "Total Tagihan",
							icon: (
								<ListChecks className="h-5 w-5 text-green-500 dark:text-green-400" />
							),
							value: filteredData.length,
							desc: "Jumlah semua tagihan terfilter",
							color: "text-slate-800 dark:text-slate-100",
						},
						{
							title: "Tagihan Lunas",
							icon: (
								<BadgeCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
							),
							value: filteredData.filter((item) => item.status === "paid")
								.length,
							desc: "Tagihan yang sudah terbayar",
							color: "text-slate-800 dark:text-green-400",
						},
						{
							title: "Tagihan Belum Lunas",
							icon: (
								<BadgeAlert className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
							),
							value: filteredData.filter((item) => item.status !== "paid")
								.length,
							desc: "Tagihan menunggu pembayaran atau belum lunas",
							color: "text-slate-800 dark:text-yellow-400",
						},
					].map((stat, i) => (
						<CardStatistik key={i} stat={stat} i={i} />
					))}
				</div>

				{/* Tabel Tagihan */}
				<TabelTagihan
					filteredData={filteredData}
					currentPage={currentPage}
					itemsPerPage={itemsPerPage}
					setCurrentPage={setCurrentPage}
					totalPages={totalPages}
					router={router}
				/>
			</div>
		</div>
	);
}

"use client";

import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Loader2,
	AlertTriangle,
	User,
	Mail,
	Phone,
	Home,
	BookUser,
	Users,
	ShieldCheck,
	Info,
	Edit3,
	GraduationCap,
	MapPin,
	Calendar,
	Briefcase,
	CreditCard, // Ditambahkan karena digunakan di DetailItem
} from "lucide-react";
import Cookies from "js-cookie";

// --- Fungsi Helper Dipindahkan ke Luar Komponen ---
const formatDate = (dateString) => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(date);
};

// --- Komponen DetailItem Dipindahkan ke Luar Komponen dan di-memo-kan ---
const DetailItem = React.memo(
	({ label, value, icon: IconComponent, className = "" }) => (
		<div className={`flex items-start space-x-3 py-3 ${className}`}>
			{IconComponent && (
				<IconComponent className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mt-1 flex-shrink-0" />
			)}
			<div>
				<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
					{label}
				</p>
				<p className="text-md text-gray-800 dark:text-gray-200">
					{value || "-"}
				</p>
			</div>
		</div>
	)
);
DetailItem.displayName = "DetailItem";

const PageProfilSiswa = () => {
	const [userId, setUserId] = useState(null);
	const [studentData, setStudentData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Mengambil dan mendekode token untuk mendapatkan userId
		try {
			const userToken = Cookies.get("token");
			if (userToken) {
				const payload = userToken.split(".")[1];
				// Menggunakan Buffer.from untuk atob yang lebih aman jika tersedia (Node.js context)
				// Di browser, atob() sudah cukup. Error handling akan menangkap jika payload tidak valid.
				const decoded = JSON.parse(
					typeof Buffer !== "undefined"
						? Buffer.from(payload, "base64").toString()
						: atob(payload)
				);
				setUserId(decoded?.id || null);
			} else {
				// Jika tidak ada token, bisa langsung set error atau kondisi "belum login"
				setError("Sesi tidak ditemukan. Silakan login kembali.");
				setIsLoading(false);
			}
		} catch (e) {
			console.error("Error decoding token:", e);
			setError("Sesi tidak valid. Silakan login kembali.");
			setUserId(null);
			setIsLoading(false);
		}
	}, []); // Hanya berjalan sekali saat komponen dimuat

	useEffect(() => {
		// Fungsi untuk mengambil data siswa
		const fetchStudentData = async () => {
			// Jangan fetch jika userId belum ada (misalnya, token tidak ada atau invalid)
			if (!userId) {
				// Jika error sudah di-set oleh useEffect sebelumnya, jangan timpa dengan isLoading false saja
				if (!error) setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null); // Reset error sebelum fetch baru
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa/${userId}` // Menggunakan endpoint spesifik siswa
				);
				if (!response.ok) {
					if (response.status === 404) {
						throw new Error("Profil siswa tidak ditemukan.");
					}
					throw new Error(
						`Gagal mengambil data siswa: ${response.statusText} (status: ${response.status})`
					);
				}
				const studentProfileData = await response.json();

				// Menyesuaikan dengan struktur API yang mungkin: { success: true, data: {...} } atau langsung objek siswa
				if (
					studentProfileData &&
					typeof studentProfileData.data !== "undefined"
				) {
					setStudentData(studentProfileData.data);
				} else if (
					studentProfileData &&
					typeof studentProfileData.success === "undefined"
				) {
					// Jika API mengembalikan objek siswa secara langsung tanpa wrapper 'data' atau 'success'
					setStudentData(studentProfileData);
				} else {
					throw new Error(
						"Format data siswa tidak valid dari API atau siswa tidak ditemukan."
					);
				}
			} catch (err) {
				console.error("Error fetching student data:", err);
				setError(
					err.message || "Terjadi kesalahan saat mengambil data profil."
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStudentData();
	}, [userId, error]); // Tambahkan error sebagai dependency untuk re-fetch jika error di-reset (meskipun tombol Coba Lagi lebih eksplisit)

	// Tampilan Loading
	if (isLoading) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50  dark:bg-slate-900 p-4 md:p-8">
				<Loader2 className="h-12 w-12 animate-spin text-emerald-600 dark:text-emerald-500" />
				<p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
					Memuat profil Anda...
				</p>
			</div>
		);
	}

	// Tampilan Error
	if (error) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 text-center">
				<AlertTriangle className="h-12 w-12 text-red-500" />
				<h2 className="mt-4 text-xl font-semibold text-red-700 dark:text-red-400">
					Gagal Memuat Profil
				</h2>
				<p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
				<Button
					onClick={() => {
						window.location.reload();
					}}
					className="mt-6 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
				>
					Coba Lagi
				</Button>
			</div>
		);
	}

	// Tampilan jika data siswa tidak ada setelah loading (misalnya, userId null atau fetch berhasil tapi data kosong)
	if (!studentData) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen  dark:bg-slate-900 p-4 md:p-8">
				<Info className="h-12 w-12 text-gray-400" />
				<p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
					Data profil tidak tersedia atau Anda belum login.
				</p>
			</div>
		);
	}

	// Destructuring data siswa dengan default value untuk keamanan
	const { nama, email, telepon, alamat, akun_siswa = {} } = studentData;
	const {
		nisn,
		nik,
		tempat_lahir,
		tgl_lahir,
		jenis_kelamin,
		disabilitas,
		kebutuhan_khusus,
		no_kip,
		nama_ayah,
		nama_ibu,
		nama_wali,
		kelas = {}, // Default ke objek kosong
		jurusan = {}, // Default ke objek kosong
		unit = {}, // Default ke objek kosong
		gambar,
	} = akun_siswa;

	return (
		<div className="flex-1 p-4 md:p-8 pt-6  dark:bg-slate-900 min-h-screen">
			<Card className="w-full max-w-5xl mx-auto shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border dark:border-slate-700">
				{/* Header Profil */}
				<div className="relative h-48 bg-gradient-to-r from-emerald-500 to-green-500 dark:from-emerald-600 dark:to-green-600">
					<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 p-1 bg-white dark:bg-slate-800 rounded-full shadow-lg">
						<Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800">
							<AvatarImage
								src={
									gambar ||
									`https://avatar.vercel.sh/${nama || "siswa"}.png?size=128`
								} // Fallback jika nama juga null
								alt={nama || "Avatar Siswa"}
							/>
							<AvatarFallback className="text-4xl bg-emerald-100 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-200">
								{nama?.substring(0, 2).toUpperCase() || "SI"}
							</AvatarFallback>
						</Avatar>
					</div>
				</div>

				{/* Informasi Nama dan Aksi */}
				<div className="pt-20 md:pt-8 px-6 md:px-8 pb-6 text-center md:text-left md:flex md:items-end md:justify-between">
					<div className="md:ml-40">
						<h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
							{nama || "Nama Siswa"}
						</h1>
						<p className="text-md text-emerald-600 dark:text-emerald-400">
							{email || "email@example.com"}
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{kelas?.nama_kelas || "Kelas Tidak Diketahui"}
							{jurusan?.nama_jurusan && ` - ${jurusan.nama_jurusan}`}
							{unit?.nama_unit &&
								unit.nama_unit !== kelas?.nama_kelas && // Hanya tampilkan jika beda dari kelas
								` (${unit.nama_unit})`}
						</p>
					</div>
				</div>

				<Separator className="dark:bg-slate-700" />

				{/* Tabs untuk Detail Informasi */}
				<Tabs defaultValue="pribadi" className="w-full px-6 md:px-8 py-6">
					<TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 gap-2  dark:bg-slate-700 rounded-lg p-1">
						<TabsTrigger
							value="pribadi"
							className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 dark:text-gray-600 dark:data-[state=active]:text-gray-50"
						>
							Data Pribadi
						</TabsTrigger>
						<TabsTrigger
							value="akademik"
							className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 dark:text-gray-600 dark:data-[state=active]:text-gray-50"
						>
							Akademik
						</TabsTrigger>
						<TabsTrigger
							value="keluarga"
							className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 dark:text-gray-600 dark:data-[state=active]:text-gray-50"
						>
							Data Keluarga
						</TabsTrigger>
					</TabsList>

					<TabsContent value="pribadi" className="mt-6">
						<Card className="border-none shadow-none bg-transparent">
							{" "}
							{/* Dibuat transparan agar menyatu */}
							<CardHeader className="px-0 pt-0">
								{" "}
								{/* Padding dihilangkan untuk lebih rapat */}
								<CardTitle className="text-xl text-emerald-700 dark:text-emerald-400">
									Informasi Pribadi
								</CardTitle>
								<CardDescription>Detail data diri siswa.</CardDescription>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 px-0">
								{" "}
								{/* Mengurangi gap-y */}
								<DetailItem label="Nama Lengkap" value={nama} icon={User} />
								<DetailItem label="Email" value={email} icon={Mail} />
								<DetailItem
									label="Nomor Telepon"
									value={telepon}
									icon={Phone}
								/>
								<DetailItem
									label="Alamat Lengkap"
									value={alamat}
									icon={Home}
									className="md:col-span-2"
								/>
								<Separator className="md:col-span-2 my-2 dark:bg-slate-600" />{" "}
								{/* Margin lebih kecil */}
								<DetailItem
									label="NISN" // Label disingkat
									value={nisn}
									icon={BookUser}
								/>
								<DetailItem
									label="NIK" // Label disingkat
									value={nik}
									icon={Info}
								/>
								<DetailItem
									label="Tempat Lahir"
									value={tempat_lahir}
									icon={MapPin}
								/>
								<DetailItem
									label="Tanggal Lahir"
									value={formatDate(tgl_lahir)}
									icon={Calendar}
								/>
								<DetailItem
									label="Jenis Kelamin"
									value={jenis_kelamin}
									icon={Users}
								/>
								<DetailItem
									label="Nomor KIP" // Label disingkat
									value={no_kip}
									icon={CreditCard}
								/>
								<Separator className="md:col-span-2 my-2 dark:bg-slate-600" />
								<DetailItem
									label="Disabilitas"
									value={disabilitas}
									icon={ShieldCheck}
								/>
								<DetailItem
									label="Kebutuhan Khusus"
									value={kebutuhan_khusus}
									icon={ShieldCheck}
								/>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="akademik" className="mt-6">
						<Card className="border-none shadow-none bg-transparent">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="text-xl text-emerald-700 dark:text-emerald-400">
									Informasi Akademik
								</CardTitle>
								<CardDescription>
									Detail status akademik siswa saat ini.
								</CardDescription>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 px-0">
								<DetailItem
									label="Kelas"
									value={kelas?.nama_kelas}
									icon={GraduationCap}
								/>
								<DetailItem
									label="Jurusan"
									value={jurusan?.nama_jurusan}
									icon={Briefcase}
								/>
								<DetailItem
									label="Unit Sekolah"
									value={unit?.nama_unit}
									icon={Home}
								/>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="keluarga" className="mt-6">
						<Card className="border-none shadow-none bg-transparent">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="text-xl text-emerald-700 dark:text-emerald-400">
									Informasi Orang Tua / Wali
								</CardTitle>
								<CardDescription>Data kontak keluarga siswa.</CardDescription>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 px-0">
								<DetailItem label="Nama Ayah" value={nama_ayah} icon={User} />
								<DetailItem label="Nama Ibu" value={nama_ibu} icon={User} />
								<DetailItem
									label="Nama Wali"
									value={nama_wali}
									icon={User}
									className="md:col-span-2"
								/>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	);
};

export default PageProfilSiswa;

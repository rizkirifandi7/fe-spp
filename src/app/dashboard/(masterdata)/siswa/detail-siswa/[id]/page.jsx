"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	Loader2,
	AlertTriangle,
	UserCircle,
	Mail,
	Phone,
	Home,
	Hash,
	Calendar,
	Users,
	ShieldCheck,
	Info,
	Briefcase,
	GraduationCap,
	Paperclip,
	ArrowLeft,
	UserSquare,
	MapPin,
	Users2,
	User,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils"; // Asumsi cn utility sudah ada

// --- Fungsi Helper ---
const formatDate = (dateString) => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "-"; // Validasi tanggal
	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "long", // Menggunakan 'long' untuk nama bulan penuh
		year: "numeric",
	}).format(date);
};

// --- Komponen DetailInfoItem yang Ditingkatkan ---
const DetailInfoItem = React.memo(
	({ label, value, icon: Icon, multiline = false, className = "" }) => (
		<div className={cn("flex items-start space-x-4 py-3", className)}>
			{Icon && (
				<Icon className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0 opacity-90" />
			)}
			<div className="flex-1">
				<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
					{label}
				</p>
				{multiline ? (
					<p className="mt-1 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
						{value || "-"}
					</p>
				) : (
					<p className="mt-1 text-sm font-medium text-gray-800">
						{value || "-"}
					</p>
				)}
			</div>
		</div>
	)
);
DetailInfoItem.displayName = "DetailInfoItem";

const DetailSiswaPage = () => {
	const [siswa, setSiswa] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { id } = useParams();
	const router = useRouter();

	useEffect(() => {
		const fetchData = async () => {
			if (!id) {
				setError("ID Siswa tidak ditemukan di URL.");
				setIsLoading(false);
				return;
			}
			try {
				setIsLoading(true);
				setError(null);
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa/${id}`
				);

				if (response.data && response.data.data) {
					setSiswa(response.data.data);
				} else {
					throw new Error(
						"Format data siswa tidak sesuai atau data tidak ditemukan."
					);
				}
			} catch (err) {
				console.error("Error fetching siswa data:", err);
				let errorMessage = "Gagal memuat data siswa.";
				if (err.response?.status === 404) {
					errorMessage = "Data siswa dengan ID ini tidak ditemukan.";
				} else if (err.message) {
					errorMessage = err.message;
				}
				setError(errorMessage);
				toast.error(errorMessage);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (isLoading) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-150px)] bg-slate-50 p-6 md:p-8">
				<Loader2 className="h-20 w-20 animate-spin text-emerald-500" />
				<p className="mt-8 text-2xl font-medium text-gray-700 tracking-wider">
					Memuat Detail Siswa...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-150px)] bg-slate-50 p-6 md:p-8 text-center">
				<div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full">
					<AlertTriangle className="mx-auto h-20 w-20 text-red-400" />
					<h2 className="mt-6 text-2xl font-bold text-red-700">
						Gagal Memuat Data
					</h2>
					<p className="mt-3 text-gray-600">{error}</p>
					<Button
						onClick={() => router.back()}
						className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
					>
						<ArrowLeft className="mr-2 h-5 w-5" /> Kembali
					</Button>
				</div>
			</div>
		);
	}

	if (!siswa) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-150px)] bg-slate-50 p-6 md:p-8 text-center">
				<div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full">
					<Info className="mx-auto h-20 w-20 text-yellow-500" />
					<h2 className="mt-6 text-2xl font-bold text-yellow-700">
						Data Tidak Ditemukan
					</h2>
					<p className="mt-3 text-gray-600">
						Data siswa yang Anda cari tidak dapat ditemukan.
					</p>
					<Button
						onClick={() => router.back()}
						className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
					>
						<ArrowLeft className="mr-2 h-5 w-5" /> Kembali
					</Button>
				</div>
			</div>
		);
	}

	const { nama, email, telepon, alamat, akun_siswa = {} } = siswa;
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
		kelas = {},
		jurusan = {},
		unit = {},
		gambar,
	} = akun_siswa;

	return (
		<div className="flex-1 p-4 md:p-6 lg:p-8  min-h-screen">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<Button
						onClick={() => router.back()}
						variant="outline"
						className="border-gray-300 hover:bg-gray-100 shadow-sm"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Kembali ke Daftar
					</Button>
					{/* Bisa tambahkan tombol aksi lain seperti Edit */}
				</div>

				<Card className="w-full shadow-sm rounded-2xl overflow-hidden border-gray-200/80">
					{/* Profile Header Section */}
					<div className="relative">
						<div className="h-24 md:h-32 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-t-2xl" />
						<div className="absolute left-1/2 md:left-12 -translate-x-1/2 md:translate-x-0 -bottom-16 md:-bottom-12 p-1.5 bg-slate-100 rounded-full shadow-xl">
							<Avatar className="h-32 w-32 md:h-36 md:w-36 border-4 border-slate-100">
								<AvatarImage
									src={
										gambar ||
										`https://avatar.vercel.sh/${nama || "siswa"}.png?size=160`
									}	
									alt={nama || "Foto Siswa"}
									className="object-cover"
								/>
								<AvatarFallback className="text-4xl bg-emerald-100 text-emerald-600 font-semibold">
									{nama?.substring(0, 2).toUpperCase() || "SI"}
								</AvatarFallback>
							</Avatar>
						</div>
					</div>

					{/* Name and Basic Info Section */}
					<div className="pt-20 md:pt-8 px-6 md:px-10 pb-6 text-center md:text-left">
						<div className="md:ml-44">
							{" "}
							{/* Adjust margin based on avatar size and positioning */}
							<h1 className="text-3xl font-bold text-gray-800">
								{nama || "Nama Siswa"}
							</h1>
							<p className="text-md text-emerald-600 font-medium mt-1">
								NISN: {nisn || "-"}
							</p>
							<p className="text-sm text-gray-500 mt-0.5">
								{kelas?.nama_kelas || "Kelas Tidak Diketahui"}
								{jurusan?.nama_jurusan ? ` - ${jurusan.nama_jurusan}` : ""}
								{unit?.nama_unit && unit.nama_unit !== kelas?.nama_kelas
									? ` (${unit.nama_unit})`
									: ""}
							</p>
						</div>
					</div>

					<Separator className="bg-gray-200" />

					{/* Tabs for Detailed Information */}
					<Tabs defaultValue="dataDiri" className="w-full px-6 md:px-10 py-6">
						<TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 gap-2 bg-emerald-500/10 p-1.5 rounded-lg mb-6 h-14">
							<TabsTrigger
								value="dataDiri"
								className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md py-2.5 text-emerald-700 font-semibold transition-all duration-200 text-sm"
							>
								<UserCircle className="mr-2 h-5 w-5" /> Data Diri
							</TabsTrigger>
							<TabsTrigger
								value="akademikTambahan"
								className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md py-2.5 text-emerald-700 font-semibold transition-all duration-200 text-sm"
							>
								<GraduationCap className="mr-2 h-5 w-5" /> Akademik & Lainnya
							</TabsTrigger>
							<TabsTrigger
								value="keluarga"
								className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md py-2.5 text-emerald-700 font-semibold transition-all duration-200 text-sm"
							>
								<Users className="mr-2 h-5 w-5" /> Keluarga
							</TabsTrigger>
						</TabsList>

						<TabsContent value="dataDiri" className="mt-2">
							<Card className="border-gray-200/80 shadow-md rounded-lg">
								<CardHeader>
									<CardTitle className="text-xl text-emerald-700 flex items-center">
										<User className="mr-3 h-6 w-6" />
										Informasi Pribadi
									</CardTitle>
								</CardHeader>
								<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 pt-2 pb-6 px-6">
									<DetailInfoItem
										label="Nama Lengkap"
										value={nama}
										icon={User}
									/>
									<DetailInfoItem label="NIK" value={nik} icon={Info} />
									<DetailInfoItem label="Email" value={email} icon={Mail} />
									<DetailInfoItem
										label="Telepon"
										value={telepon}
										icon={Phone}
									/>
									<DetailInfoItem
										label="Tempat Lahir"
										value={tempat_lahir}
										icon={MapPin}
									/>
									<DetailInfoItem
										label="Tanggal Lahir"
										value={formatDate(tgl_lahir)}
										icon={Calendar}
									/>
									<DetailInfoItem
										label="Umur"
										value={akun_siswa?.umur}
										icon={Calendar}
									/>
									<DetailInfoItem
										label="Jenis Kelamin"
										value={jenis_kelamin}
										icon={Users2}
									/>
									<DetailInfoItem
										label="Alamat"
										value={alamat}
										icon={Home}
										multiline
										className="md:col-span-2"
									/>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="akademikTambahan" className="mt-2">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<Card className="border-gray-200/80 shadow-md rounded-lg">
									<CardHeader>
										<CardTitle className="text-xl text-emerald-700 flex items-center">
											<GraduationCap className="mr-3 h-6 w-6" />
											Informasi Akademik
										</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-1 gap-x-8 gap-y-1 pt-2 pb-6 px-6">
										<DetailInfoItem
											label="Unit Sekolah"
											value={unit?.nama_unit}
											icon={Home}
										/>
										<DetailInfoItem
											label="Kelas"
											value={kelas?.nama_kelas}
											icon={Users2}
										/>
										<DetailInfoItem
											label="Jurusan"
											value={jurusan?.nama_jurusan}
											icon={Briefcase}
										/>
										<DetailInfoItem
											label="Status Akun"
											value={siswa.status === "on" ? "Aktif" : "Non-Aktif"}
											icon={ShieldCheck}
										/>
									</CardContent>
								</Card>
								<Card className="border-gray-200/80 shadow-md rounded-lg">
									<CardHeader>
										<CardTitle className="text-xl text-emerald-700 flex items-center">
											<Info className="mr-3 h-6 w-6" />
											Informasi Tambahan
										</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-1 gap-x-8 gap-y-1 pt-2 pb-6 px-6">
										<DetailInfoItem
											label="Disabilitas"
											value={disabilitas}
											icon={ShieldCheck}
										/>
										<DetailInfoItem
											label="Kebutuhan Khusus"
											value={kebutuhan_khusus}
											icon={ShieldCheck}
										/>
										<DetailInfoItem
											label="No. KIP"
											value={no_kip}
											icon={Paperclip}
										/>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="keluarga" className="mt-2">
							<Card className="border-gray-200/80 shadow-md rounded-lg">
								<CardHeader>
									<CardTitle className="text-xl text-emerald-700 flex items-center">
										<Users className="mr-3 h-6 w-6" />
										Informasi Keluarga
									</CardTitle>
								</CardHeader>
								<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 pt-2 pb-6 px-6">
									<DetailInfoItem
										label="Nama Ayah"
										value={nama_ayah}
										icon={UserSquare}
									/>
									<DetailInfoItem
										label="Nama Ibu"
										value={nama_ibu}
										icon={UserSquare}
									/>
									<DetailInfoItem
										label="Nama Wali"
										value={nama_wali}
										icon={UserSquare}
										className="md:col-span-2"
									/>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</Card>
			</div>
		</div>
	);
};

export default DetailSiswaPage;

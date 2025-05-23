"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	User,
	Bell,
	DollarSign,
	AlertTriangle,
	CheckCircle2,
	XCircle,
	RefreshCw,
	Loader2,
	CreditCard,
	Info,
	ExternalLink,
} from "lucide-react";
import Cookies from "js-cookie";
import RiwayatPembayaran from "./_components/riwayat-pembayaran";

// --- Fungsi Helper ---
const formatRupiah = (numberString, isMetricCard = false) => {
	const number = parseFloat(numberString);
	if (isNaN(number)) {
		return isMetricCard ? "0" : "Rp 0";
	}
	if (isMetricCard) {
		return new Intl.NumberFormat("id-ID", {
			style: "decimal",
			minimumFractionDigits: 0,
		}).format(number);
	}
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(number);
};

const formatDate = (dateString, includeTime = false) => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	const options = { day: "2-digit", month: "long", year: "numeric" };
	if (includeTime) {
		options.hour = "2-digit";
		options.minute = "2-digit";
		options.hour12 = false;
	}
	return new Intl.DateTimeFormat("id-ID", options).format(date);
};

const monthNames = [
	// Diperlukan jika item.bulan dan item.tahun digunakan
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];

// --- Komponen StatusDisplay (Mirip dengan PageTagihanSiswa untuk konsistensi) ---
const StatusDisplay = React.memo(({ status, type = "item" }) => {
	const lowerCaseStatus = status?.toLowerCase();
	let icon = (
		<CreditCard
			className={`mr-1.5 h-3.5 w-3.5 ${
				type === "item" ? "" : "h-4 w-4"
			} text-gray-500`}
		/>
	);
	let badgeClasses = "bg-gray-100 text-gray-700 border border-gray-300";
	let text = status || "N/A";

	switch (lowerCaseStatus) {
		case "paid":
			icon = (
				<CheckCircle2
					className={`mr-1.5 ${
						type === "item" ? "h-3.5 w-3.5" : "h-4 w-4"
					} text-emerald-600`}
				/>
			);
			badgeClasses = "bg-emerald-50 text-emerald-700 border border-emerald-300";
			text = "Lunas";
			break;
		case "partial":
			icon = (
				<RefreshCw
					className={`mr-1.5 ${
						type === "item" ? "h-3.5 w-3.5" : "h-4 w-4"
					} text-yellow-600 animate-spin`}
				/>
			);
			badgeClasses = "bg-yellow-50 text-yellow-700 border border-yellow-300";
			text = "Sebagian";
			break;
		case "unpaid":
			icon = (
				<XCircle
					className={`mr-1.5 ${
						type === "item" ? "h-3.5 w-3.5" : "h-4 w-4"
					} text-red-600`}
				/>
			);
			badgeClasses = "bg-red-50 text-red-700 border border-red-300";
			text = "Belum Lunas";
			break;
		// Anda bisa menambahkan case untuk "pending" jika ingin tampilan khusus
		case "pending":
			icon = (
				<RefreshCw
					className={`mr-1.5 ${
						type === "item" ? "h-3.5 w-3.5" : "h-4 w-4"
					} text-blue-600 animate-spin`}
				/>
			); // Contoh warna biru untuk pending
			badgeClasses = "bg-blue-50 text-blue-700 border border-blue-300";
			text = "Pending";
			break;
	}

	return (
		<Badge
			className={`capitalize text-xs whitespace-nowrap px-2.5 py-1 rounded-full font-medium flex items-center ${badgeClasses}`}
		>
			{icon}
			{text}
		</Badge>
	);
});
StatusDisplay.displayName = "StatusDisplay";

// Komponen StatCard yang Ditingkatkan
const StudentStatCard = React.memo(
	({ title, value, icon: Icon, colorClass, isLoading, unit, description }) => {
		if (isLoading) {
			return (
				<Card className="w-full bg-white shadow-sm rounded-xl border border-gray-200/50 p-1">
					<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
						<CardTitle className="text-sm font-medium text-gray-500 h-5 bg-gray-200 animate-pulse rounded w-3/5"></CardTitle>
						{Icon && (
							<div className="h-6 w-6 bg-gray-200 animate-pulse rounded-md"></div>
						)}
					</CardHeader>
					<CardContent className="pt-0">
						<div className="text-3xl font-bold h-9 bg-gray-200 animate-pulse rounded-md w-4/5 mb-2"></div>
						{description && (
							<div className="text-xs h-4 bg-gray-200 animate-pulse rounded w-full"></div>
						)}
					</CardContent>
				</Card>
			);
		}
		return (
			<Card className="w-full bg-white shadow-sm hover:shadow-emerald-500/10 transition-all duration-300 rounded-xl border border-gray-200/80 pt-4 transform hover:-translate-y-1">
				<CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
					<CardTitle className="text-sm font-medium text-gray-500">
						{title}
					</CardTitle>
					{Icon && (
						<Icon className={`h-5 w-5 ${colorClass || "text-emerald-600"}`} />
					)}
				</CardHeader>
				<CardContent className="pt-0">
					<div
						className={`text-3xl font-bold ${colorClass || "text-gray-800"}`}
					>
						{value}
						{unit && <span className="text-base font-medium ml-1">{unit}</span>}
					</div>
					{description && (
						<p className="text-xs text-gray-500 pt-1">{description}</p>
					)}
				</CardContent>
			</Card>
		);
	}
);
StudentStatCard.displayName = "StudentStatCard";

const PageHomeSiswa = () => {
	const [studentData, setStudentData] = useState(null);
	const [tagihanSiswa, setTagihanSiswa] = useState([]);
	const [pembayaranSiswa, setPembayaranSiswa] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalTunggakanSiswa, setTotalTunggakanSiswa] = useState(0);
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		try {
			const userToken = Cookies.get("token");
			if (userToken) {
				const payload = userToken.split(".")[1];
				const decoded = JSON.parse(
					typeof Buffer !== "undefined"
						? Buffer.from(payload, "base64").toString()
						: atob(payload)
				);
				setUserId(decoded?.id || null);
				if (!decoded?.id) {
					setError("ID pengguna tidak ditemukan dalam token.");
					setIsLoading(false); // Hentikan loading jika ID tidak ada
				}
			} else {
				setError("Sesi tidak ditemukan. Silakan login kembali.");
				setIsLoading(false); // Hentikan loading jika token tidak ada
			}
		} catch (e) {
			console.error("Error decoding token:", e);
			setError("Sesi tidak valid. Silakan login kembali.");
			setUserId(null);
			setIsLoading(false); // Hentikan loading jika token error
		}
	}, []);

	const fetchDataSiswa = useCallback(async () => {
		if (!userId) {
			if (!error) setIsLoading(false); // Hentikan loading jika tidak ada userId dan tidak ada error sebelumnya
			return;
		}
		setIsLoading(true);
		setError(null); // Reset error sebelum fetch
		try {
			const siswaPromise = fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa`
			).then((res) => {
				if (!res.ok)
					throw new Error(
						`Gagal mengambil data siswa: ${res.statusText} (status: ${res.status})`
					);
				return res.json();
			});
			const tagihanPromise = fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/tagihan`
			).then((res) => {
				if (!res.ok)
					throw new Error(
						`Gagal mengambil data tagihan: ${res.statusText} (status: ${res.status})`
					);
				return res.json();
			});

			const [semuaSiswaData, semuaTagihanData] = await Promise.all([
				siswaPromise,
				tagihanPromise,
			]);

			const currentStudent = semuaSiswaData.data?.find((s) => s.id === userId);
			if (!currentStudent) throw new Error("Data siswa tidak ditemukan.");
			setStudentData(currentStudent);

			const tagihanMilikSiswa =
				semuaSiswaData.data?.filter((t) => t.id_siswa === userId) || []; // Seharusnya semuaTagihanData

			// Koreksi: filter dari semuaTagihanData, bukan semuaSiswaData
			const filteredTagihanMilikSiswa =
				semuaTagihanData.data?.filter((t) => t.id_siswa === userId) || [];
			setTagihanSiswa(filteredTagihanMilikSiswa);

			let tunggakan = 0;
			filteredTagihanMilikSiswa.forEach((t) => {
				// PERBAIKAN 1: Ubah kondisi untuk menghitung tunggakan
				if (t.status !== "paid") {
					tunggakan += parseFloat(t.total_jumlah) - parseFloat(t.jumlah_bayar);
				}
			});
			setTotalTunggakanSiswa(tunggakan);

			const riwayat = [];
			filteredTagihanMilikSiswa.forEach((tagihan) => {
				if (tagihan.pembayaran && tagihan.pembayaran.length > 0) {
					tagihan.pembayaran.forEach((p) => {
						riwayat.push({
							id: p.id,
							tanggal: p.createdAt,
							deskripsi:
								p.catatan || `Pembayaran tagihan ${tagihan.nomor_tagihan}`,
							jumlah: parseFloat(p.jumlah),
							metode: p.metode_pembayaran,
							statusVerifikasi: p.sudah_verifikasi,
						});
					});
				}
			});
			setPembayaranSiswa(
				riwayat
					.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
					.slice(0, 5)
			);
		} catch (err) {
			console.error("Error fetching student data:", err);
			setError(err.message || "Terjadi kesalahan saat mengambil data.");
		} finally {
			setIsLoading(false);
		}
	}, [userId, error]); // error ditambahkan sebagai dependency

	useEffect(() => {
		if (
			userId &&
			(!error || (!error.includes("Sesi") && !error.includes("token")))
		) {
			fetchDataSiswa();
		}
	}, [userId, error, fetchDataSiswa]);

	if (isLoading) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 md:p-8">
				<Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
				<p className="mt-4 text-lg font-medium text-gray-700 tracking-wider">
					Memuat Dashboard Anda...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 md:p-8 text-center">
				<AlertTriangle className="h-16 w-16 text-red-500" />
				<h2 className="mt-6 text-2xl font-semibold text-red-600">
					Oops! Terjadi Kesalahan
				</h2>
				<p className="mt-2 text-gray-600 max-w-md">{error}</p>
				<Button
					onClick={fetchDataSiswa} // Memanggil fetchDataSiswa untuk coba lagi
					className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
				>
					Coba Lagi
				</Button>
			</div>
		);
	}

	if (!userId && !error) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen  p-4 md:p-8 text-center">
				<Info className="h-16 w-16 text-yellow-500" />
				<h2 className="mt-6 text-2xl font-semibold text-yellow-600">
					Sesi Tidak Ditemukan
				</h2>
				<p className="mt-2 text-gray-600 max-w-md">
					Harap login kembali untuk mengakses dashboard Anda.
				</p>
			</div>
		);
	}

	if (!studentData && !isLoading) {
		// Ditambahkan !isLoading untuk memastikan tidak tampil saat masih loading
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen  p-4 md:p-8 text-center">
				<User className="h-16 w-16 text-gray-400" />
				<h2 className="mt-6 text-2xl font-semibold text-gray-600">
					Profil Siswa Tidak Ditemukan
				</h2>
				<p className="mt-2 text-gray-500 max-w-md">
					Data untuk pengguna ini tidak dapat ditemukan.
				</p>
			</div>
		);
	}

	// PERBAIKAN 2: Filter untuk tagihanAktif
	const tagihanAktif = tagihanSiswa.filter((t) => t.status !== "paid");

	return (
		<div className="flex-1 space-y-8 p-4 md:p-8 pt-6  text-gray-800 min-h-screen">
			{/* Header Section */}
			<header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 pb-6 border-b border-gray-200">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						Selamat Datang,{" "}
						<span className="text-gray-900">
							{" "}
							{/* Warna nama siswa diubah */}
							{studentData?.nama || "Siswa"}
						</span>
						!
					</h1>
					<p className="text-gray-600 mt-1">
						Ini ringkasan keuangan dan tagihan penting Anda.
					</p>
				</div>
			</header>

			{/* Profil Singkat dan Metrik Utama */}
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
				<Card className="lg:col-span-1 bg-white shadow-sm rounded-xl border border-gray-200/80 p-6 hover:border-emerald-500/50 transition-all duration-300">
					<div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
						<Avatar className="h-24 w-24 border-4 border-emerald-500/30 shadow-lg">
							<AvatarImage
								src={
									studentData?.akun_siswa?.gambar ||
									`https://avatar.vercel.sh/${
										studentData?.nama || "student"
									}.png?size=128`
								}
								alt={studentData?.nama}
							/>
							<AvatarFallback className="text-3xl bg-emerald-50 text-emerald-600">
								{studentData?.nama?.substring(0, 2).toUpperCase() || "SI"}
							</AvatarFallback>
						</Avatar>
						<div className="text-center sm:text-left flex-grow">
							<CardTitle className="text-2xl font-semibold text-gray-900">
								{studentData?.nama || "Nama Siswa"}
							</CardTitle>
							<CardDescription className="text-emerald-600 text-sm mt-1">
								{studentData?.email || "email@example.com"}
							</CardDescription>
							<Separator className="my-3 bg-gray-200" />
							<div className="text-xs text-gray-600 space-y-1">
								<p>
									<strong>NISN:</strong> {studentData?.akun_siswa?.nisn || "-"}
								</p>
								<p>
									<strong>Kelas:</strong>{" "}
									{studentData?.akun_siswa?.kelas?.nama_kelas || "-"}{" "}
									{studentData?.akun_siswa?.jurusan?.nama_jurusan
										? `(${studentData.akun_siswa.jurusan.nama_jurusan})`
										: ""}
								</p>
							</div>
						</div>
					</div>
				</Card>

				<div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
					<StudentStatCard
						title="Total Tunggakan"
						value={`Rp ${formatRupiah(totalTunggakanSiswa, true)}`}
						icon={DollarSign}
						colorClass={"text-gray-900"}
						isLoading={isLoading}
						description={
							totalTunggakanSiswa > 0
								? `${tagihanAktif.length} tagihan belum lunas` // Menggunakan tagihanAktif.length yang sudah dikoreksi
								: "🎉 Semua tagihan lunas!"
						}
					/>
					<StudentStatCard
						title="Tagihan Perlu Dibayar"
						value={tagihanAktif.length} // Menggunakan tagihanAktif.length yang sudah dikoreksi
						unit=" Tagihan"
						icon={AlertTriangle}
						colorClass="text-gray-900"
						isLoading={isLoading}
						description="Tagihan dengan status belum lunas, sebagian, atau pending." // Deskripsi disesuaikan
					/>
				</div>
			</section>

			{/* Daftar Tagihan Aktif */}
			<section>
				<Card className="bg-white shadow-sm rounded-xl border border-gray-200/80 overflow-hidden">
					<CardHeader className="border-b border-gray-200 px-6 py-4">
						<CardTitle className="text-xl font-semibold text-gray-900">
							Tagihan Perlu Tindakan
						</CardTitle>
						<CardDescription className="text-gray-600 mt-1">
							Berikut adalah tagihan yang memerlukan pembayaran segera.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						{tagihanAktif.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow className="border-b-0 bg-gray-50 hover:bg-gray-100/50">
										<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider w-[180px] px-6 py-3">
											No. Tagihan
										</TableHead>
										<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
											Deskripsi
										</TableHead>
										<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
											Jatuh Tempo
										</TableHead>
										<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
											Sisa Bayar
										</TableHead>
										<TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
											Status Item
										</TableHead>
										<TableHead className="text-right text-gray-500 font-semibold uppercase text-xs tracking-wider px-6 py-3">
											Aksi
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tagihanAktif.map(
										(
											tagihan // Iterasi tagihanAktif yang sudah dikoreksi
										) =>
											tagihan.item_tagihan
												?.filter((item) => item.status !== "paid") // Filter item yang belum lunas
												.map((item, index) => (
													<TableRow
														key={`${tagihan.id}-${item.id}`}
														className={`border-gray-200 hover:bg-gray-50/70 transition-colors duration-150 ${
															index ===
															tagihan.item_tagihan.filter(
																(i) => i.status !== "paid"
															).length -
																1
																? "border-b-0"
																: "border-b"
														}`}
													>
														<TableCell className="font-medium text-emerald-600 px-6 py-4">
															{tagihan.nomor_tagihan}
														</TableCell>
														<TableCell className="text-gray-800 px-6 py-4">
															{item.deskripsi}
															<div className="text-xs text-gray-500 mt-0.5">
																{tagihan.jenis_pembayaran?.nama}
																{item.bulan && item.tahun
																	? ` - ${monthNames[item.bulan - 1]} ${
																			item.tahun
																	  }`
																	: ""}
															</div>
														</TableCell>
														<TableCell
															className={`px-6 py-4 ${
																new Date(item.jatuh_tempo) < new Date() &&
																item.status !== "paid"
																	? "text-red-600 font-semibold"
																	: "text-gray-700"
															}`}
														>
															{formatDate(item.jatuh_tempo)}
															{new Date(item.jatuh_tempo) < new Date() &&
																item.status !== "paid" && (
																	<p className="text-xs mt-0.5">
																		(Lewat Batas)
																	</p>
																)}
														</TableCell>
														<TableCell className="font-semibold text-gray-800 px-6 py-4">
															{formatRupiah(item.jumlah)}
														</TableCell>
														<TableCell className="px-6 py-4">
															<StatusDisplay status={item.status} type="item" />
														</TableCell>
														<TableCell className="text-right px-6 py-4">
															{item.midtrans_url && ( // Tombol bayar hanya jika ada midtrans_url (dan item belum lunas)
																<Button
																	variant="default"
																	size="sm"
																	onClick={() =>
																		window.open(item.midtrans_url, "_blank")
																	}
																	className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all"
																>
																	Bayar{" "}
																	<ExternalLink className="ml-2 h-3.5 w-3.5" />
																</Button>
															)}
														</TableCell>
													</TableRow>
												))
									)}
								</TableBody>
							</Table>
						) : (
							<div className="text-center py-16 text-gray-500">
								<CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
								<p className="text-xl font-medium text-gray-700">Luar Biasa!</p>
								<p className="text-md mt-1">
									Tidak ada tagihan yang perlu dibayar saat ini.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</section>

			{/* Riwayat Pembayaran */}
			<RiwayatPembayaran pembayaranSiswa={pembayaranSiswa} />
		</div>
	);
};

export default PageHomeSiswa;

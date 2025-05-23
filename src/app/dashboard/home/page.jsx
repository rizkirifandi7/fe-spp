"use client";

import React, { useState, useEffect } from "react";
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
import {
	ArrowUpRight,
	DollarSign,
	Users,
	CreditCard,
	AlertTriangle,
	ListChecks,
	CalendarClock,
	CheckCircle2,
	XCircle,
	RefreshCw,
	Loader2,
	TrendingUp,
	TrendingDown,
} from "lucide-react"; // Added TrendingUp, TrendingDown
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";

// --- Fungsi Helper untuk Format ---
const formatRupiah = (numberString, isMetricCard = false) => {
	const number = parseFloat(numberString);
	if (isNaN(number)) {
		return isMetricCard ? "0" : "Rp 0"; // Return "0" for StatCard if it handles "Rp"
	}
	if (isMetricCard) {
		// StatCard might handle "Rp." prefix differently or expect raw number
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

const formatDate = (dateString) => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
};

const getStatusBadgeVariant = (status) => {
	switch (status) {
		case "paid":
			return "success";
		case "partial":
			return "warning";
		case "unpaid":
			return "destructive";
		default:
			return "secondary";
	}
};

const getStatusIcon = (status) => {
	switch (status) {
		case "paid":
			return <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />;
		case "partial":
			return (
				<RefreshCw className="mr-2 h-4 w-4 text-yellow-500 animate-spin" />
			);
		case "unpaid":
			return <XCircle className="mr-2 h-4 w-4 text-red-500" />;
		default:
			return <CreditCard className="mr-2 h-4 w-4 text-gray-500" />;
	}
};

// --- Komponen StatCard Baru ---
const StatCard = ({
	title,
	value,
	description,
	icon,
	colorClass,
	isLoading,
	isCurrency = true, // default to true for currency formatting
	unit, // for non-currency units like '%' or 'siswa'
}) => {
	const IconComponent = icon;

	if (isLoading) {
		return (
			<Card className="w-full shadow-sm rounded-xl">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardDescription className="font-medium h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4"></CardDescription>
					{IconComponent && (
						<div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
					)}
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-1/2 mb-2"></div>
					<div className="text-xs text-muted-foreground h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-full"></div>
				</CardContent>
			</Card>
		);
	}

	const displayValue = isCurrency
		? `Rp ${formatRupiah(value, true)}`
		: `${value}${unit || ""}`;

	return (
		<Card className="w-full shadow-sm rounded-xl hover:shadow-xl transition-shadow duration-300">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardDescription className="font-medium text-gray-600">
					{title}
				</CardDescription>
				{IconComponent && (
					<IconComponent
						className={`h-5 w-5 ${colorClass || "text-muted-foreground"}`}
					/>
				)}
			</CardHeader>
			<CardContent>
				<div className={`text-2xl font-bold ${colorClass || "text-gray-800"}`}>
					{displayValue}
				</div>
				{description && (
					<p className="text-xs text-muted-foreground pt-1">{description}</p>
				)}
			</CardContent>
		</Card>
	);
};

const MainPage = () => {
	const [dashboardData, setDashboardData] = useState({
		totalPenerimaanBulanIni: 0,
		totalTunggakan: 0,
		persentasePembayaran: 0,
		saldoKas: 0,
		totalSiswaAktif: 0,
		tagihanTerbaru: [],
		siswaMenunggak: [],
		statistikStatusTagihan: [],
		trenPembayaranBulanan: [],
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fungsi untuk memproses data yang diambil dari API
	const processData = (tagihanList, kasList, siswaList) => {
		const tagihan = tagihanList || [];
		const kas = kasList || [];
		const akunSiswa = siswaList || [];

		const bulanIni = new Date().getMonth();
		const tahunIni = new Date().getFullYear();

		let penerimaanBulanIni = 0;
		tagihan.forEach((t) => {
			const tglTagihan = new Date(t.createdAt);
			if (
				t.status === "paid" &&
				tglTagihan.getMonth() === bulanIni &&
				tglTagihan.getFullYear() === tahunIni
			) {
				penerimaanBulanIni += parseFloat(t.jumlah_bayar);
			} else if (t.status === "partial") {
				const pembayaranTerkait = kas.filter(
					(k) =>
						k.deskripsi.includes(t.nomor_tagihan) &&
						new Date(k.createdAt).getMonth() === bulanIni &&
						new Date(k.createdAt).getFullYear() === tahunIni &&
						k.tipe === "masuk"
				);
				pembayaranTerkait.forEach((p) => (penerimaanBulanIni += p.jumlah));
			}
		});

		let tunggakan = 0;
		const menunggakList = [];
		tagihan.forEach((t) => {
			if (t.status === "unpaid" || t.status === "partial") {
				const sisa = parseFloat(t.total_jumlah) - parseFloat(t.jumlah_bayar);
				tunggakan += sisa;
				if (sisa > 0 && t.siswa && t.siswa.akun_siswa) {
					menunggakList.push({
						nama: t.siswa.nama,
						kelas: `${t.siswa.akun_siswa.kelas?.nama_kelas || "N/A"} - ${
							t.siswa.akun_siswa.jurusan?.nama_jurusan || "N/A"
						}`,
						jumlah: sisa,
						jatuhTempo:
							t.item_tagihan?.find((item) => item.status === "unpaid")
								?.jatuh_tempo || t.item_tagihan?.[0]?.jatuh_tempo,
						nomorTagihan: t.nomor_tagihan,
					});
				}
			}
		});

		const totalTagihanAll = tagihan.length; // Semua tagihan, bukan hanya bulan ini
		const tagihanLunasAll = tagihan.filter((t) => t.status === "paid").length;
		const persentase =
			totalTagihanAll > 0 ? (tagihanLunasAll / totalTagihanAll) * 100 : 0;

		let saldo = 0;
		kas.forEach((k) => {
			if (k.tipe === "masuk") saldo += k.jumlah;
			else if (k.tipe === "keluar") saldo -= k.jumlah;
		});

		const siswaAktif = akunSiswa.filter((s) => s.status === "on").length;

		const statusCounts = tagihan.reduce((acc, curr) => {
			acc[curr.status] = (acc[curr.status] || 0) + 1;
			return acc;
		}, {});

		const statistikStatus = [
			{ name: "Lunas", value: statusCounts.paid || 0, color: "#22c55e" },
			{ name: "Sebagian", value: statusCounts.partial || 0, color: "#f59e0b" },
			{
				name: "Belum Lunas",
				value: statusCounts.unpaid || 0,
				color: "#ef4444",
			},
		];

		const trenPembayaranBulananData = {};
		const monthNames = [
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

		tagihan.forEach((t) => {
			const date = new Date(t.createdAt);
			const year = date.getFullYear();
			const month = date.getMonth();
			const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

			if (!trenPembayaranBulananData[monthKey]) {
				trenPembayaranBulananData[monthKey] = {
					name: `${monthNames[month]} ${year}`,
					year: year,
					month: month,
					Lunas: 0,
					BelumLunas: 0,
				};
			}

			if (t.status === "paid") {
				trenPembayaranBulananData[monthKey].Lunas += 1;
			} else if (t.status === "unpaid" || t.status === "partial") {
				trenPembayaranBulananData[monthKey].BelumLunas += 1;
			}
		});

		const sortedTrenPembayaran = Object.values(trenPembayaranBulananData).sort(
			(a, b) => {
				if (a.year !== b.year) {
					return a.year - b.year;
				}
				return a.month - b.month;
			}
		);

		const finalTrenPembayaran = sortedTrenPembayaran.slice(-6);

		setDashboardData({
			totalPenerimaanBulanIni: penerimaanBulanIni,
			totalTunggakan: tunggakan,
			persentasePembayaran: parseFloat(persentase.toFixed(1)),
			saldoKas: saldo,
			totalSiswaAktif: siswaAktif,
			tagihanTerbaru: tagihan
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
				.slice(0, 5),
			siswaMenunggak: menunggakList
				.sort((a, b) => b.jumlah - a.jumlah)
				.slice(0, 5),
			statistikStatusTagihan: statistikStatus,
			trenPembayaranBulanan: finalTrenPembayaran,
		});
	};

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const [tagihanRes, kasRes, siswaRes] = await Promise.all([
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/tagihan`),
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/kas`),
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa`),
				]);

				if (!tagihanRes.ok)
					throw new Error(
						`Gagal mengambil data tagihan: ${tagihanRes.statusText}`
					);
				if (!kasRes.ok)
					throw new Error(`Gagal mengambil data kas: ${kasRes.statusText}`);
				if (!siswaRes.ok)
					throw new Error(`Gagal mengambil data siswa: ${siswaRes.statusText}`);

				const tagihanData = await tagihanRes.json();
				const kasData = await kasRes.json();
				const siswaData = await siswaRes.json();

				processData(tagihanData.data, kasData.data, siswaData.data);
			} catch (err) {
				console.error("Error fetching data:", err);
				setError(err.message || "Terjadi kesalahan saat mengambil data.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	if (isLoading && !dashboardData.totalSiswaAktif) {
		// Check if initial data is not yet populated
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 md:p-8">
				<Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
				<p className="mt-4 text-lg font-medium text-gray-700">
					Memuat data dashboard...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 md:p-8 text-center">
				<AlertTriangle className="h-12 w-12 text-red-500" />
				<h2 className="mt-4 text-xl font-semibold text-red-700">
					Gagal Memuat Data
				</h2>
				<p className="mt-2 text-gray-600">{error}</p>
				<Button onClick={() => window.location.reload()} className="mt-6">
					Coba Lagi
				</Button>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-6 min-h-screen">
			<div className="flex items-center justify-between space-y-2">
				<h1 className="text-2xl font-bold tracking-tight text-gray-800">
					Dashboard Utama Keuangan SPP
				</h1>
			</div>

			{/* --- Bagian Metrik Utama Menggunakan StatCard --- */}
			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
				<StatCard
					title="Penerimaan (Bulan Ini)"
					value={dashboardData.totalPenerimaanBulanIni}
					description="Total dari bulan ini" // Contoh deskripsi
					icon={TrendingUp}
					colorClass="dark:text-emerald-500"
					isLoading={isLoading}
				/>
				<StatCard
					title="Total Tunggakan"
					value={dashboardData.totalTunggakan}
					description="Dari semua periode aktif"
					icon={AlertTriangle}
					colorClass=" dark:text-red-500"
					isLoading={isLoading}
				/>
				<StatCard
					title="Pembayaran Lunas"
					value={dashboardData.persentasePembayaran}
					description="Dari total tagihan"
					icon={ListChecks}
					colorClass=" dark:text-blue-500"
					isLoading={isLoading}
					isCurrency={false} // Bukan mata uang
					unit="%"
				/>
				<StatCard
					title="Saldo Kas"
					value={dashboardData.saldoKas}
					description="Total saldo kas saat ini"
					icon={CreditCard} // Mengganti dari Wallet agar konsisten dengan ikon sebelumnya
					colorClass=" dark:text-indigo-500"
					isLoading={isLoading}
				/>
				<StatCard
					title="Siswa Aktif"
					value={dashboardData.totalSiswaAktif}
					description="Total siswa terdaftar"
					icon={Users}
					colorClass=" dark:text-purple-500"
					isLoading={isLoading}
					isCurrency={false} // Bukan mata uang
					unit="" // Tidak ada unit spesifik, hanya angka
				/>
			</div>

			<Separator className="my-6" />

			{/* --- Bagian Grafik dan Tabel --- */}
			<div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
				<Card className="lg:col-span-4 shadow-sm hover:shadow-xl transition-shadow duration-300">
					<CardHeader>
						<CardTitle className="text-gray-700">
							Tren Pembayaran Bulanan
						</CardTitle>
						<CardDescription>
							Perbandingan tagihan lunas dan belum lunas per bulan (6 bulan
							terakhir).
						</CardDescription>
					</CardHeader>
					<CardContent className="pl-2">
						<ResponsiveContainer width="100%" height={350}>
							<BarChart data={dashboardData.trenPembayaranBulanan}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="name"
									stroke="#555"
									fontSize={12}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke="#555"
									fontSize={12}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => `${value}`}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(255, 255, 255, 0.9)",
										backdropFilter: "blur(5px)",
										borderRadius: "0.5rem",
										borderColor: "#ddd",
										boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
									}}
									formatter={(value, name) => [
										value,
										name === "Lunas" ? "Tagihan Lunas" : "Tagihan Belum Lunas",
									]}
								/>
								<Legend wrapperStyle={{ fontSize: "14px" }} />
								<Bar
									dataKey="Lunas"
									fill="#22c55e"
									radius={[4, 4, 0, 0]}
									barSize={20}
								/>
								<Bar
									dataKey="BelumLunas"
									fill="#ef4444"
									radius={[4, 4, 0, 0]}
									barSize={20}
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="lg:col-span-3 shadow-sm hover:shadow-xl transition-shadow duration-300">
					<CardHeader>
						<CardTitle className="text-gray-700">
							Distribusi Status Tagihan
						</CardTitle>
						<CardDescription>
							Persentase tagihan berdasarkan status pembayaran.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={350}>
							<PieChart>
								<Pie
									data={dashboardData.statistikStatusTagihan}
									cx="50%"
									cy="50%"
									labelLine={false}
									outerRadius={120}
									fill="#8884d8"
									dataKey="value"
									label={({ name, percent, value }) =>
										value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
									}
								>
									{dashboardData.statistikStatusTagihan.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									formatter={(value, name) => [value, name]}
									contentStyle={{
										backgroundColor: "rgba(255, 255, 255, 0.9)",
										backdropFilter: "blur(5px)",
										borderRadius: "0.5rem",
										borderColor: "#ddd",
										boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
									}}
								/>
								<Legend wrapperStyle={{ fontSize: "14px" }} />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<Separator className="my-6" />

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card className="shadow-sm hover:shadow-xl transition-shadow duration-300">
					<CardHeader>
						<CardTitle className="text-gray-700">
							Aktivitas Tagihan Terbaru
						</CardTitle>
						<CardDescription>
							5 tagihan terakhir yang dibuat atau diperbarui.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[150px]">No. Tagihan</TableHead>
									<TableHead>Siswa</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Jumlah</TableHead>
									<TableHead className="text-right">Tanggal</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dashboardData.tagihanTerbaru.length > 0 ? (
									dashboardData.tagihanTerbaru.map((tagihan) => (
										<TableRow key={tagihan.id}>
											<TableCell className="font-medium">
												{tagihan.nomor_tagihan}
											</TableCell>
											<TableCell>
												<div className="font-medium">
													{tagihan.siswa?.nama || "N/A"}
												</div>
												<div className="text-xs text-muted-foreground">
													{tagihan.siswa?.akun_siswa?.kelas?.nama_kelas ||
														"N/A"}{" "}
													-{" "}
													{tagihan.siswa?.akun_siswa?.jurusan?.nama_jurusan ||
														"N/A"}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={getStatusBadgeVariant(tagihan.status)}
													className="capitalize text-xs whitespace-nowrap"
												>
													{getStatusIcon(tagihan.status)}
													{tagihan.status}
												</Badge>
											</TableCell>
											<TableCell>
												{formatRupiah(tagihan.total_jumlah)}
											</TableCell>
											<TableCell className="text-right">
												{formatDate(tagihan.createdAt)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center text-muted-foreground"
										>
											Tidak ada aktivitas tagihan terbaru.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card className="shadow-sm hover:shadow-xl transition-shadow duration-300">
					<CardHeader>
						<CardTitle className="text-gray-700">
							Siswa dengan Tunggakan Teratas
						</CardTitle>
						<CardDescription>
							5 siswa dengan jumlah tunggakan terbesar.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nama Siswa</TableHead>
									<TableHead>Kelas</TableHead>
									<TableHead>Tunggakan</TableHead>
									<TableHead className="text-right">Jatuh Tempo</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dashboardData.siswaMenunggak.length > 0 ? (
									dashboardData.siswaMenunggak.map((siswa) => (
										<TableRow key={siswa.nomorTagihan}>
											<TableCell className="font-medium">
												{siswa.nama}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{siswa.kelas}
											</TableCell>
											<TableCell className="font-semibold text-red-600">
												{formatRupiah(siswa.jumlah)}
											</TableCell>
											<TableCell className="text-right text-xs text-muted-foreground">
												{formatDate(siswa.jatuhTempo)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center text-muted-foreground"
										>
											Tidak ada siswa dengan tunggakan.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default MainPage;

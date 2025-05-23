"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Impor Tabs
import {
	DollarSign,
	AlertTriangle,
	CheckCircle2,
	XCircle,
	RefreshCw,
	Loader2,
	CreditCard,
	ExternalLink,
	FileText,
	CalendarDays,
	ChevronRight,
	ShieldCheck,
	Info,
	Archive,
	ListChecks,
	Banknote,
	ReceiptText,
	History,
} from "lucide-react";
import Cookies from "js-cookie";

// --- Fungsi Helper ---
const formatRupiah = (numberString) => {
	const number = parseFloat(numberString);
	if (isNaN(number)) return "Rp 0";
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

// --- Komponen StatusDisplay yang Ditingkatkan ---
const StatusDisplay = React.memo(({ status, type = "tagihan" }) => {
	const lowerCaseStatus = status?.toLowerCase();
	let icon;
	let badgeClasses = "font-semibold";
	let text = status || "N/A";
	const iconSize = type === "item" ? "h-3.5 w-3.5" : "h-4 w-4";

	switch (lowerCaseStatus) {
		case "paid":
			icon = <CheckCircle2 className={`mr-2 ${iconSize} text-emerald-500`} />;
			badgeClasses +=
				" bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-600/20";
			text = "Lunas";
			break;
		case "partial":
			icon = (
				<RefreshCw
					className={`mr-2 ${iconSize} text-yellow-600 animate-spin`}
				/>
			);
			badgeClasses +=
				" bg-yellow-500/10 text-yellow-700 ring-1 ring-inset ring-yellow-600/20";
			text = "Sebagian";
			break;
		case "unpaid":
			icon = <XCircle className={`mr-2 ${iconSize} text-red-600`} />;
			badgeClasses +=
				" bg-red-500/10 text-red-700 ring-1 ring-inset ring-red-600/20";
			text = "Belum Lunas";
			break;
		case "pending":
			icon = (
				<RefreshCw className={`mr-2 ${iconSize} text-blue-600 animate-spin`} />
			);
			badgeClasses +=
				" bg-blue-500/10 text-blue-700 ring-1 ring-inset ring-blue-600/20";
			text = "Pending";
			break;
		default:
			icon = <CreditCard className={`mr-2 ${iconSize} text-gray-500`} />;
			badgeClasses +=
				" bg-gray-500/10 text-gray-700 ring-1 ring-inset ring-gray-600/20";
			break;
	}

	return (
		<Badge
			className={`capitalize text-xs whitespace-nowrap px-2.5 py-1 rounded-full flex items-center transition-colors ${badgeClasses}`}
		>
			{icon}
			{text}
		</Badge>
	);
});
StatusDisplay.displayName = "StatusDisplay";

const PageTagihanSiswa = () => {
	const [userId, setUserId] = useState(null);
	const [studentName, setStudentName] = useState("");
	const [tagihanBelumLunas, setTagihanBelumLunas] = useState([]);
	const [tagihanLunas, setTagihanLunas] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openAccordionBelumLunas, setOpenAccordionBelumLunas] = useState(null);
	const [openAccordionLunas, setOpenAccordionLunas] = useState(null);

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
					setIsLoading(false);
				}
			} else {
				setError("Sesi tidak ditemukan. Silakan login kembali.");
				setIsLoading(false);
			}
		} catch (e) {
			console.error("Error decoding token:", e);
			setError("Sesi tidak valid. Silakan login kembali.");
			setUserId(null);
			setIsLoading(false);
		}
	}, []);

	const fetchData = useCallback(async () => {
		if (!userId) {
			if (!error) setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);
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
			setStudentName(currentStudent?.nama || "Siswa");

			const tagihanMilikSiswa =
				semuaTagihanData.data?.filter((t) => t.id_siswa === userId) || [];

			const belumLunas = tagihanMilikSiswa
				.filter((t) => t.status !== "paid")
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

			const lunas = tagihanMilikSiswa
				.filter((t) => t.status === "paid")
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

			setTagihanBelumLunas(belumLunas);
			setTagihanLunas(lunas);
		} catch (err) {
			console.error("Error fetching data:", err);
			setError(err.message || "Terjadi kesalahan saat mengambil data.");
		} finally {
			setIsLoading(false);
		}
	}, [userId, error]);

	useEffect(() => {
		if (userId && !error?.includes("Sesi") && !error?.includes("token")) {
			fetchData();
		} else if (!userId && !error) {
			setIsLoading(false);
		} else if (error) {
			setIsLoading(false);
		}
	}, [userId, error, fetchData]);

	// --- Render Loading, Error, dan No User ID States ---
	if (isLoading) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 md:p-8">
				<Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
				<p className="mt-4 text-lg font-medium text-gray-700 tracking-wider">
					Memuat Riwayat Tagihan...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 md:p-8 text-center">
				<div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
					<AlertTriangle className="mx-auto h-20 w-20 text-red-500" />
					<h2 className="mt-6 text-2xl font-bold text-red-700">
						Oops! Terjadi Kesalahan
					</h2>
					<p className="mt-3 text-gray-600">{error}</p>
					<Button
						onClick={fetchData}
						className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-sm transition-all duration-300"
					>
						Coba Lagi
					</Button>
				</div>
			</div>
		);
	}

	if (!userId && !error) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 md:p-8 text-center">
				<div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
					<Info className="mx-auto h-20 w-20 text-yellow-500" />
					<h2 className="mt-6 text-2xl font-bold text-yellow-700">
						Informasi Pengguna Tidak Ditemukan
					</h2>
					<p className="mt-3 text-gray-600">
						Tidak dapat memuat tagihan tanpa informasi pengguna yang valid.
						Silakan coba login kembali.
					</p>
				</div>
			</div>
		);
	}

	// --- Komponen Render untuk Akordeon Tagihan (Reusable) ---
	const renderTagihanAccordionContent = (
		tagihanList,
		isOpenState,
		setIsOpenState,
		isLunasSection = false
	) => {
		if (tagihanList.length === 0) {
			const emptyMessage = isLunasSection
				? {
						title: "Belum Ada Tagihan Lunas",
						description:
							"Riwayat tagihan yang sudah Anda lunasi akan muncul di sini.",
				  }
				: {
						title: "Tidak Ada Tagihan Aktif",
						description:
							"Hebat! Semua tagihan Anda sudah lunas atau belum ada tagihan baru.",
				  };
			return (
				<Card className="shadow-md rounded-xl bg-white border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-all duration-300 mt-6">
					<CardContent className="text-center py-16 text-gray-500 flex flex-col items-center justify-center">
						<Info className="h-16 w-16 text-gray-300 mb-4" />
						<p className="text-lg font-semibold text-gray-600">
							{emptyMessage.title}
						</p>
						<p className="text-sm mt-1">{emptyMessage.description}</p>
					</CardContent>
				</Card>
			);
		}
		return (
			<Accordion
				type="single"
				collapsible
				className="w-full space-y-4 mt-6"
				value={isOpenState}
				onValueChange={setIsOpenState}
			>
				{tagihanList.map((tagihan) => (
					<AccordionItem
						value={`tagihan-${tagihan.id}`}
						key={tagihan.id}
						className="bg-white shadow-sm hover:shadow-emerald-500/20 data-[state=open]:shadow-emerald-500/30 transition-all duration-300 rounded-xl border border-gray-200/80 data-[state=open]:border-emerald-500 data-[state=open]:ring-2 data-[state=open]:ring-emerald-500/60 overflow-hidden group"
					>
						<AccordionTrigger className="flex items-center px-6 py-5 text-left hover:bg-emerald-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 rounded-t-xl data-[state=open]:bg-emerald-50 data-[state=open]:text-emerald-700 transition-colors duration-200">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3 md:gap-4">
								<div className="flex-grow mb-3 md:mb-0">
									<div className="flex items-center mb-1">
										<ReceiptText className="h-5 w-5 mr-2 text-emerald-600 group-data-[state=open]:text-emerald-700 transition-colors" />
										<p className="text-base font-semibold text-emerald-600 group-data-[state=open]:text-emerald-700 transition-colors">
											{tagihan.nomor_tagihan}
										</p>
									</div>
									<p className="text-sm text-gray-600 group-data-[state=open]:text-emerald-600 transition-colors ml-7 md:ml-0">
										{tagihan.deskripsi} (
										{tagihan.jenis_pembayaran?.nama || "N/A"})
									</p>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-sm w-full sm:w-auto">
									<div className="flex items-center text-gray-500 group-data-[state=open]:text-gray-700 transition-colors">
										<CalendarDays className="h-4 w-4 mr-2 text-gray-400 group-data-[state=open]:text-emerald-500 transition-colors" />
										<span className="font-medium text-gray-600 group-data-[state=open]:text-gray-800 mr-1">
											Dibuat:
										</span>{" "}
										{formatDate(tagihan.createdAt)}
									</div>
									<div className="flex items-center text-gray-500 group-data-[state=open]:text-gray-700 transition-colors">
										<Banknote className="h-4 w-4 mr-2 text-gray-400 group-data-[state=open]:text-emerald-500 transition-colors" />
										<span className="font-medium text-gray-600 group-data-[state=open]:text-gray-800 mr-1">
											Total:
										</span>{" "}
										{formatRupiah(tagihan.total_jumlah)}
									</div>
									<div className="w-full sm:w-auto pt-2 sm:pt-0">
										<StatusDisplay status={tagihan.status} type="tagihan" />
									</div>
								</div>
							</div>
						</AccordionTrigger>
						<AccordionContent className="px-6 pt-0 pb-6 border-t border-gray-200 data-[state=open]:animate-accordion-down bg-gray-50/50 rounded-b-xl">
							<div className="pt-5 space-y-5">
								<div>
									<h4 className="text-base font-semibold mb-2 text-gray-700">
										Rincian Item Tagihan:
									</h4>
									{tagihan.item_tagihan && tagihan.item_tagihan.length > 0 ? (
										<div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
											<Table className="min-w-full">
												<TableHeader className="bg-gray-100">
													<TableRow className="border-b-gray-200">
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
															Deskripsi
														</TableHead>
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
															Jatuh Tempo
														</TableHead>
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
															Jumlah
														</TableHead>
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
															Status
														</TableHead>
														{!isLunasSection && (
															<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500 text-right">
																Aksi
															</TableHead>
														)}
													</TableRow>
												</TableHeader>
												<TableBody className="bg-white divide-y divide-gray-200">
													{tagihan.item_tagihan.map((item) => (
														<TableRow
															key={item.id}
															className="hover:bg-emerald-50/30 transition-colors"
														>
															<TableCell className="py-3.5 px-4 text-sm text-gray-700">
																{item.deskripsi}
																{item.bulan && item.tahun ? (
																	<p className="text-xs text-gray-500 mt-0.5">
																		{monthNames[item.bulan - 1]} {item.tahun}
																	</p>
																) : null}
															</TableCell>
															<TableCell
																className={`py-3.5 px-4 text-sm ${
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
															<TableCell className="py-3.5 px-4 text-sm font-medium text-gray-800">
																{formatRupiah(item.jumlah)}
															</TableCell>
															<TableCell className="py-3.5 px-4">
																<StatusDisplay
																	status={item.status}
																	type="item"
																/>
															</TableCell>
															{!isLunasSection && (
																<TableCell className="py-3.5 px-4 text-right">
																	{item.status !== "paid" &&
																		item.midtrans_url && (
																			<Button
																				variant="default"
																				size="sm"
																				onClick={() =>
																					window.open(
																						item.midtrans_url,
																						"_blank"
																					)
																				}
																				className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-md shadow-sm hover:shadow-sm transition-all"
																			>
																				Bayar{" "}
																				<ExternalLink className="ml-1.5 h-3.5 w-3.5" />
																			</Button>
																		)}
																	{item.status === "paid" &&
																		!isLunasSection && (
																			<span className="text-sm text-emerald-600 flex items-center justify-end">
																				<CheckCircle2 className="mr-1.5 h-4 w-4" />{" "}
																				Lunas
																			</span>
																		)}
																</TableCell>
															)}
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									) : (
										<p className="text-sm text-gray-500 italic">
											Tidak ada rincian item untuk tagihan ini.
										</p>
									)}
								</div>

								{tagihan.pembayaran && tagihan.pembayaran.length > 0 && (
									<div>
										<h4 className="text-base font-semibold mb-2 text-gray-700">
											Riwayat Pembayaran Tagihan Ini:
										</h4>
										<div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
											<Table className="min-w-full">
												<TableHeader className="bg-gray-100">
													<TableRow className="border-b-gray-200">
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
															Tanggal
														</TableHead>
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
															Jumlah
														</TableHead>
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
															Metode
														</TableHead>
														<TableHead className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500 text-right">
															Status
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody className="bg-white divide-y divide-gray-200">
													{tagihan.pembayaran.map((p) => (
														<TableRow
															key={p.id}
															className="hover:bg-emerald-50/30 transition-colors"
														>
															<TableCell className="py-3.5 px-4 text-sm text-gray-700">
																<div className="flex items-center">
																	<CalendarDays className="h-4 w-4 mr-2 text-emerald-600 opacity-70" />
																	{formatDate(p.createdAt, true)}
																</div>
															</TableCell>
															<TableCell className="py-3.5 px-4 text-sm font-medium text-gray-800">
																{formatRupiah(p.jumlah)}
															</TableCell>
															<TableCell className="py-3.5 px-4 capitalize text-sm text-gray-700">
																<div className="flex items-center">
																	<CreditCard className="h-4 w-4 mr-2 text-gray-400" />
																	{p.metode_pembayaran}
																</div>
															</TableCell>
															<TableCell className="py-3.5 px-4 text-right">
																<Badge
																	variant={
																		p.sudah_verifikasi ? "success" : "warning"
																	}
																	className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center justify-center w-fit ml-auto shadow-sm
                                      ${
																				p.sudah_verifikasi
																					? "bg-emerald-100 text-emerald-700 border border-emerald-200"
																					: "bg-yellow-100 text-yellow-700 border border-yellow-200"
																			}`}
																>
																	{p.sudah_verifikasi ? (
																		<ShieldCheck className="mr-1.5 h-4 w-4" />
																	) : (
																		<RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
																	)}
																	{p.sudah_verifikasi
																		? "Terverifikasi"
																		: "Pending"}
																</Badge>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</div>
								)}
							</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		);
	};

	return (
		<div className="flex-1 p-4 md:p-6 lg:p-8 pt-6  min-h-screen">
			<header className="pb-8 border-b border-gray-200 mb-8">
				<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
					Tagihan Saya:{" "}
					<span className="text-gray-900 font-semibold">{studentName}!</span>
				</h1>
				<p className="mt-2 text-base md:text-md text-gray-600 max-w-2xl">
					Pantau semua tagihan pembayaran sekolah Anda dengan mudah.
				</p>
			</header>

			<Tabs defaultValue="belumLunas" className="w-full border p-4 rounded-lg">
				<TabsList className="grid w-full grid-cols-2 bg-emerald-500/10 p-1 rounded-lg h-14">
					<TabsTrigger
						value="belumLunas"
						className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md py-2.5 text-emerald-700 font-semibold transition-all duration-200"
					>
						<ListChecks className="mr-2 h-5 w-5" /> Tagihan Aktif (
						{tagihanBelumLunas.length})
					</TabsTrigger>
					<TabsTrigger
						value="lunas"
						className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md py-2.5 text-emerald-700 font-semibold transition-all duration-200"
					>
						<Archive className="mr-2 h-5 w-5" /> Riwayat Lunas (
						{tagihanLunas.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="belumLunas">
					{renderTagihanAccordionContent(
						tagihanBelumLunas,
						openAccordionBelumLunas,
						setOpenAccordionBelumLunas
					)}
				</TabsContent>
				<TabsContent value="lunas">
					{renderTagihanAccordionContent(
						tagihanLunas,
						openAccordionLunas,
						setOpenAccordionLunas,
						true // isLunasSection = true
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default PageTagihanSiswa;

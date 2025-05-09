"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
	CheckCircle2,
	AlertCircle,
	CreditCard,
	Banknote,
	Wallet,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getCookie } from "@/actions/cookies";
import { toast } from "sonner";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const paymentMethods = [
	{ value: "tunai", label: "Tunai", icon: <Banknote className="h-5 w-5" /> },
	{
		value: "transfer",
		label: "Transfer Bank",
		icon: <Banknote className="h-5 w-5" />,
	},
	{
		value: "e-wallet",
		label: "E-Wallet",
		icon: <Wallet className="h-5 w-5" />,
	},
];

export default function Pembayaran() {
	const router = useRouter();
	const { idTagihan } = useParams();

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [tagihan, setTagihan] = useState(null);
	const [siswa, setSiswa] = useState(null);
	const [selectedItems, setSelectedItems] = useState([]);
	const [formData, setFormData] = useState({
		jumlah: "",
		metode_pembayaran: "tunai",
		catatan: "",
	});

	// Fetch data tagihan dan siswa
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const token = (await getCookie("token"))?.value;
				const headers = { Authorization: `Bearer ${token}` };

				// Fetch data tagihan
				const tagihanResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/tagihan/${idTagihan}`
				);
				const tagihanData = await tagihanResponse.json();

				if (tagihanData.success) {
					setTagihan(tagihanData.data);

					// Fetch data siswa
					const siswaResponse = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa/${tagihanData.data.id_siswa}`,
						{ headers }
					);
					const siswaData = await siswaResponse.json();

					if (siswaData.message === "Data siswa ditemukan") {
						setSiswa(siswaData.data);
					}
				}
			} catch (error) {
				console.error("Fetch data error:", error);
				toast.error("Gagal memuat data tagihan");
			} finally {
				setIsLoading(false);
			}
		};

		if (idTagihan) {
			fetchData();
		}
	}, [idTagihan]);

	// Handle item selection
	const handleItemSelect = (itemId) => {
		const newSelectedItems = selectedItems.includes(itemId)
			? selectedItems.filter((id) => id !== itemId)
			: [...selectedItems, itemId];

		setSelectedItems(newSelectedItems);

		// Calculate and set the payment amount when items are selected/deselected
		if (tagihan) {
			const selectedTotal = tagihan.item_tagihan
				.filter((item) => newSelectedItems.includes(item.id))
				.reduce((sum, item) => sum + parseFloat(item.jumlah), 0);

			setFormData((prev) => ({
				...prev,
				jumlah: selectedTotal.toString(),
			}));
		}
	};

	// Handle select all unpaid items
	const handleSelectAll = () => {
		if (!tagihan) return;

		const unpaidItemIds = tagihan.item_tagihan
			.filter((item) => item.status === "unpaid")
			.map((item) => item.id);

		if (selectedItems.length === unpaidItemIds.length) {
			setSelectedItems([]);
			setFormData((prev) => ({ ...prev, jumlah: "" }));
		} else {
			setSelectedItems(unpaidItemIds);

			// Calculate total for all unpaid items
			const totalUnpaid = tagihan.item_tagihan
				.filter((item) => item.status === "unpaid")
				.reduce((sum, item) => sum + parseFloat(item.jumlah), 0);

			setFormData((prev) => ({
				...prev,
				jumlah: totalUnpaid.toString(),
			}));
		}
	};

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle payment submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const token = (await getCookie("token"))?.value;
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/tagihan/bayar/${idTagihan}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						...formData,
						jumlah: parseFloat(formData.jumlah),
						item_dibayar: selectedItems,
					}),
				}
			);

			const result = await response.json();

			if (result.success) {
				toast.success("Pembayaran berhasil diproses!", {
					description: "Tagihan telah berhasil dibayarkan",
				});
				router.push(`/dashboard/pembayaran`);
			} else {
				throw new Error(result.error || "Gagal melakukan pembayaran");
			}
		} catch (error) {
			toast.error("Pembayaran gagal", {
				description:
					error.message || "Terjadi kesalahan saat memproses pembayaran",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Calculate totals
	const calculateTotals = () => {
		if (!tagihan) return { totalUnpaid: 0, selectedTotal: 0 };

		const unpaidItems = tagihan.item_tagihan.filter(
			(item) => item.status === "unpaid"
		);

		const totalUnpaid = unpaidItems.reduce(
			(sum, item) => sum + parseFloat(item.jumlah),
			0
		);

		const selectedTotal = unpaidItems
			.filter((item) => selectedItems.includes(item.id))
			.reduce((sum, item) => sum + parseFloat(item.jumlah), 0);

		return { totalUnpaid, selectedTotal };
	};

	const { totalUnpaid, selectedTotal } = calculateTotals();

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<Skeleton className="h-10 w-48" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-64 w-full" />
					</div>
					<div className="space-y-6">
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (!tagihan || !siswa) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
					<div className="flex items-center">
						<AlertCircle className="h-5 w-5 mr-2" />
						<p className="font-bold">Error</p>
					</div>
					<p className="mt-2">Gagal memuat data tagihan. Silakan coba lagi.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			{/* Header */}
			<div className="flex items-center mb-8 gap-4">
				<Button
					variant="outline"
					onClick={() => router.back()}
					className="flex items-center gap-2 text-slate-800 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-100"
				>
					<ArrowLeft className="h-5 w-5" />
					Kembali
				</Button>
				<h1 className="text-2xl font-bold text-slate-800 dark:text-emerald-100">
					Pembayaran Tagihan
				</h1>
				<div className="w-10"></div> {/* Spacer for alignment */}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Payment Items */}
				<div className="lg:col-span-2 space-y-6">
					{/* Student Info */}
					<Card className="bg-white dark:bg-slate-800 border dark:border-emerald-700 shadow-sm">
						<CardHeader className="">
							<CardTitle className="text-md font-semibold text-slate-800 dark:text-emerald-100">
								Informasi Siswa
							</CardTitle>
						</CardHeader>
						<CardContent className="text-sm">
							<div className="grid grid-cols-4 gap-x-4 gap-y-2">
								<div>
									<p className="text-xs text-slate-600 dark:text-emerald-400 mb-1">
										Nama
									</p>
									<p className="font-medium text-slate-800 dark:text-emerald-100">
										{siswa.nama}
									</p>
								</div>
								<div>
									<p className="text-xs text-slate-600 dark:text-emerald-400 mb-1">
										Kelas
									</p>
									<p className="font-medium text-slate-800 dark:text-emerald-100">
										{siswa.akun_siswa.kelas.nama_kelas} -{" "}
										{siswa.akun_siswa.jurusan.nama_jurusan}
									</p>
								</div>
								<div>
									<p className="text-xs text-slate-600 dark:text-emerald-400 mb-1">
										No. Tagihan
									</p>
									<p className="font-medium text-slate-800 dark:text-emerald-100">
										{tagihan.nomor_tagihan}
									</p>
								</div>
								<div>
									<p className="text-xs text-slate-600 dark:text-emerald-400 mb-1">
										Status Tagihan
									</p>
									<Badge
										variant=""
										className={`text-xs px-2 py-0.5 ${
											tagihan.status === "paid"
												? "bg-green-100 text-emerald-800 dark:bg-green-700 dark:text-green-50"
												: tagihan.status === "partial"
												? "bg-yellow-100 text-yellow-800 dark:bg-green-700 dark:text-green-50"
												: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-50"
										}`} // Adjusted padding for a softer look
									>
										{tagihan.status === "paid"
											? "Lunas"
											: tagihan.status === "partial"
											? "Sebagian Lunas"
											: "Belum Lunas"}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment Items */}
					<Card className="bg-white dark:bg-slate-800 border dark:border-emerald-700 shadow-sm">
						<CardHeader className="">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg font-semibold text-slate-800 dark:text-emerald-100">
									Item Tagihan
								</CardTitle>
								<Button
									variant="outline"
									size="sm"
									onClick={handleSelectAll}
									className="text-sm text-slate-600 dark:text-emerald-400 hover:text-slate-800 dark:hover:text-emerald-100"
									disabled={
										tagihan.item_tagihan.filter(
											(item) => item.status === "unpaid"
										).length === 0
									}
								>
									{selectedItems.length ===
										tagihan.item_tagihan.filter(
											(item) => item.status === "unpaid"
										).length && selectedItems.length > 0
										? "Batal Pilih Semua"
										: "Pilih Semua Belum Lunas"}
								</Button>
							</div>
						</CardHeader>
						<CardContent className={"overflow-x-auto rounded-md"}>
							<Table className="w-full border dark:border-emerald-700 rounded-md">
								<TableHeader
									className={"bg-slate-50 dark:bg-slate-800/50 rounded-md"}
								>
									<TableRow className="dark:border-emerald-700">
										<TableHead className="w-[60px] text-center"></TableHead>
										<TableHead className="text-slate-800 dark:text-emerald-100">
											Deskripsi
										</TableHead>
										<TableHead className="text-slate-800 dark:text-emerald-100">
											Periode
										</TableHead>
										<TableHead className="text-right text-slate-800 dark:text-emerald-100">
											Jumlah
										</TableHead>
										<TableHead className="text-center text-slate-800 dark:text-emerald-100">
											Status
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tagihan.item_tagihan.map((item) => (
										<TableRow
											key={item.id}
											className={` dark:border-emerald-700/50 ${
												selectedItems.includes(item.id) &&
												item.status === "unpaid"
													? "bg-emerald-50 dark:bg-emerald-900/40"
													: ""
											} ${
												item.status === "paid"
													? "bg-slate-50/50 dark:bg-slate-800/30 opacity-80"
													: "hover:bg-slate-50 dark:hover:bg-slate-700/30"
											} ${
												item.status === "unpaid"
													? "cursor-pointer"
													: "cursor-not-allowed"
											}`}
											onClick={() =>
												item.status === "unpaid" && handleItemSelect(item.id)
											}
										>
											<TableCell className="text-center">
												{item.status === "unpaid" ? (
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleItemSelect(item.id);
														}}
														className={`mx-auto flex-shrink-0 h-5 w-5 rounded border ${
															selectedItems.includes(item.id)
																? "bg-emerald-500 border-emerald-600 dark:bg-emerald-600 dark:border-emerald-500"
																: "border-slate-300 dark:border-emerald-600"
														} flex items-center justify-center transition-colors duration-200`}
													>
														{selectedItems.includes(item.id) && (
															<CheckCircle2 className="h-3.5 w-3.5 text-white" />
														)}
													</button>
												) : (
													<div className="mx-auto flex-shrink-0 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
														<CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
													</div>
												)}
											</TableCell>
											<TableCell>
												<div className="font-medium text-slate-800 dark:text-emerald-100">
													{item.deskripsi}
												</div>
											</TableCell>
											<TableCell className="text-sm text-slate-600 dark:text-emerald-400">
												{item.bulan && item.tahun
													? `${new Date(0, item.bulan - 1).toLocaleString(
															"id-ID",
															{ month: "long" }
													  )} ${item.tahun}`
													: "-"}
											</TableCell>
											<TableCell className="text-right font-medium text-slate-800 dark:text-emerald-100">
												{new Intl.NumberFormat("id-ID", {
													style: "currency",
													currency: "IDR",
													minimumFractionDigits: 0,
												}).format(parseFloat(item.jumlah))}
											</TableCell>
											<TableCell className="text-center">
												<Badge
													variant="outline"
													className={`text-xs px-2 py-0.5 ${
														item.status === "paid"
															? "bg-green-100 text-emerald-800 dark:bg-green-700 dark:text-green-50"
															: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-50"
													}`} // Adjusted padding for a softer look
												>
													{item.status === "paid" ? "Lunas" : "Belum Lunas"}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Payment Summary */}
				<div className="space-y-6">
					{/* Payment Summary */}
					<Card className="bg-white dark:bg-slate-800 border dark:border-emerald-700 shadow-sm">
						<CardHeader className="">
							<CardTitle className="text-lg font-semibold text-slate-800 dark:text-emerald-100">
								Ringkasan Pembayaran
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-emerald-400 text-sm">
										Total Belum Lunas:
									</span>
									<span className="font-medium text-slate-800 dark:text-emerald-100">
										{new Intl.NumberFormat("id-ID", {
											style: "currency",
											currency: "IDR",
											minimumFractionDigits: 0,
										}).format(totalUnpaid)}
									</span>
								</div>

								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-emerald-400 text-sm">
										Item Terpilih:
									</span>
									<span className="font-medium text-slate-800 dark:text-emerald-100">
										{selectedItems.length} item
									</span>
								</div>

								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-emerald-400 text-sm">
										Total Dipilih:
									</span>
									<span className="font-medium text-slate-800 dark:text-emerald-100">
										{new Intl.NumberFormat("id-ID", {
											style: "currency",
											currency: "IDR",
											minimumFractionDigits: 0,
										}).format(selectedTotal)}
									</span>
								</div>

								<Separator className="my-2 bg-emerald-200 dark:bg-emerald-700" />

								<div className="flex justify-between">
									<span className="text-lg font-semibold text-slate-800 dark:text-emerald-100">
										Total Pembayaran:
									</span>
									<span className="text-lg font-bold text-slate-600 dark:text-emerald-400">
										{new Intl.NumberFormat("id-ID", {
											style: "currency",
											currency: "IDR",
											minimumFractionDigits: 0,
										}).format(parseFloat(formData.jumlah || 0))}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment Form */}
					<Card className="bg-white dark:bg-slate-800 border  dark:border-emerald-700 shadow-sm">
						<CardHeader className="">
							<CardTitle className="text-lg font-semibold text-slate-800 dark:text-emerald-100">
								Metode Pembayaran
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-emerald-300 mb-1">
										Jumlah Pembayaran
									</label>
									<Input
										type="number"
										name="jumlah"
										value={formData.jumlah}
										onChange={handleInputChange}
										min={selectedItems.length > 0 ? "1" : "0"} // Allow partial payment, min 1 if items selected
										className="bg-white dark:bg-slate-700 border dark:border-emerald-600 focus:ring-emerald-500 focus:border-emerald-500"
										required
										disabled={selectedItems.length === 0}
									/>
									<p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
										{selectedItems.length > 0 ? (
											<>
												Total item terpilih:{" "}
												{new Intl.NumberFormat("id-ID", {
													style: "currency",
													currency: "IDR",
													minimumFractionDigits: 0,
												}).format(selectedTotal)}
												. Anda bisa membayar sebagian.
											</>
										) : (
											"Pilih item tagihan terlebih dahulu"
										)}
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-emerald-300 mb-1">
										Metode Pembayaran
									</label>
									<Select
										value={formData.metode_pembayaran}
										onValueChange={(value) =>
											setFormData({ ...formData, metode_pembayaran: value })
										}
									>
										<SelectTrigger className="bg-white dark:bg-slate-700 border dark:border-emerald-600 focus:ring-emerald-500 focus:border-emerald-500">
											<SelectValue placeholder="Pilih metode pembayaran" />
										</SelectTrigger>
										<SelectContent className="dark:bg-slate-800 border dark:border-emerald-700">
											{paymentMethods.map((method) => (
												<SelectItem
													key={method.value}
													value={method.value}
													className="dark:focus:bg-emerald-900/50"
												>
													<div className="flex items-center gap-2">
														{method.icon}
														{method.label}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-emerald-300 mb-1">
										Catatan (Opsional)
									</label>
									<Textarea
										type="text"
										name="catatan"
										value={formData.catatan}
										onChange={handleInputChange}
										className="bg-white dark:bg-slate-700 border dark:border-emerald-600 focus:ring-emerald-500 focus:border-emerald-500"
										placeholder="Contoh: Pembayaran SPP Bulan Januari"
									/>
								</div>

								<Button
									type="submit"
									disabled={
										isSubmitting ||
										selectedItems.length === 0 ||
										parseFloat(formData.jumlah) <= 0 || // Ensure amount is positive
										(selectedTotal > 0 &&
											parseFloat(formData.jumlah) > selectedTotal) // Allow partial payment, but not more than selected total
									}
									className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-md transition-colors duration-200"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Memproses...
										</>
									) : (
										<>
											<CreditCard className="h-4 w-4 mr-2" />
											Konfirmasi Pembayaran
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

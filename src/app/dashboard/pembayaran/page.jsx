"use client";

import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import TableView from "@/components/data-table/table-view";
import { formatToIDR } from "@/lib/formatIdr";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HapusPembayaran from "./_components/hapus-pembayaran";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Loader2,
	Search,
	X,
	ChevronsUpDown,
	Check,
	ArrowUpDown,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status/status-badge";

const PageDataPembayaranSiswa = () => {
	const [namaQuery, setNamaQuery] = useState("");
	const [kelasQuery, setKelasQuery] = useState("");
	const [jurusanQuery, setJurusanQuery] = useState("");

	const [uniqueNamaList, setUniqueNamaList] = useState([]);
	const [uniqueKelasList, setUniqueKelasList] = useState([]);
	const [uniqueJurusanList, setUniqueJurusanList] = useState([]);

	const [openNamaCommand, setOpenNamaCommand] = useState(false);

	const [filteredTagihan, setFilteredTagihan] = useState([]);
	const [allTagihanData, setAllTagihanData] = useState([]);

	const [isLoading, setIsLoading] = useState(false); // For search action
	const [isFetchingAll, setIsFetchingAll] = useState(true); // For initial data load
	const [error, setError] = useState(null);
	const [hasSearched, setHasSearched] = useState(false);

	const fetchAllTagihan = useCallback(async (showLoadingSpinner = true) => {
		if (showLoadingSpinner) setIsFetchingAll(true);
		setError(null);
		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/tagihan`
			);
			const data = response.data.data || [];
			setAllTagihanData(data);

			const klasses = new Set();
			const jurusans = new Set();
			const names = new Set();
			data.forEach((item) => {
				if (item.siswa?.nama) {
					names.add(item.siswa.nama);
				}
				if (item.siswa?.akun_siswa?.kelas?.nama_kelas) {
					klasses.add(item.siswa.akun_siswa.kelas.nama_kelas);
				}
				if (item.siswa?.akun_siswa?.jurusan?.nama_jurusan) {
					jurusans.add(item.siswa.akun_siswa.jurusan.nama_jurusan);
				}
			});
			setUniqueNamaList(Array.from(names).sort());
			setUniqueKelasList(Array.from(klasses).sort());
			setUniqueJurusanList(Array.from(jurusans).sort());

			return data;
		} catch (err) {
			console.error("Error fetching all tagihan data:", err);
			setError(
				"Gagal memuat data tagihan. Pastikan API berjalan dan coba lagi."
			);
			setAllTagihanData([]);
			setUniqueNamaList([]);
			setUniqueKelasList([]);
			setUniqueJurusanList([]);
			return [];
		} finally {
			if (showLoadingSpinner) setIsFetchingAll(false);
		}
	}, []);

	useEffect(() => {
		fetchAllTagihan();
	}, [fetchAllTagihan]);

	const applyFilters = useCallback(
		(dataToFilter) => {
			if (!namaQuery.trim() && !kelasQuery.trim() && !jurusanQuery.trim()) {
				setFilteredTagihan([]);
				return;
			}

			const filtered = dataToFilter.filter((t) => {
				const namaMatch =
					!namaQuery.trim() ||
					t.siswa?.nama?.toLowerCase().includes(namaQuery.trim().toLowerCase());
				const kelasMatch =
					!kelasQuery.trim() ||
					t.siswa?.akun_siswa?.kelas?.nama_kelas === kelasQuery.trim();
				const jurusanMatch =
					!jurusanQuery.trim() ||
					t.siswa?.akun_siswa?.jurusan?.nama_jurusan === jurusanQuery.trim();
				return namaMatch && kelasMatch && jurusanMatch;
			});

			setFilteredTagihan(filtered);
			if (hasSearched && filtered.length === 0) {
				setError(
					"Tidak ada data tagihan yang cocok dengan kriteria pencarian."
				);
			} else {
				setError(null);
			}
		},
		[namaQuery, kelasQuery, jurusanQuery, hasSearched]
	);

	const handleSearch = async () => {
		if (!namaQuery.trim() && !kelasQuery.trim() && !jurusanQuery.trim()) {
			setError("Masukkan setidaknya satu kriteria pencarian.");
			setFilteredTagihan([]);
			setHasSearched(true);
			return;
		}
		setIsLoading(true);
		setError(null);
		setHasSearched(true);

		const currentData =
			allTagihanData.length > 0 ? allTagihanData : await fetchAllTagihan(false);
		applyFilters(currentData);
		setIsLoading(false);
	};

	const refreshFilteredData = async () => {
		setIsLoading(true);
		const updatedAllTagihan = await fetchAllTagihan(false);
		applyFilters(updatedAllTagihan);
		setIsLoading(false);
	};

	const clearSearch = () => {
		setNamaQuery("");
		setKelasQuery("");
		setJurusanQuery("");
		setFilteredTagihan([]);
		setError(null);
		setHasSearched(false);
	};

	const columns = [
		{
			accessorKey: "nomor_tagihan",
			header: "Nomor Tagihan",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("nomor_tagihan")}</div>
			),
		},
		{
			accessorKey: "siswa.nama",
			header: "Nama Siswa",
			cell: ({ row }) => row.original?.siswa?.nama || "-",
		},
		{
			accessorKey: "siswa.akun_siswa.kelas.nama_kelas",
			header: "Kelas",
			cell: ({ row }) =>
				row.original?.siswa?.akun_siswa?.kelas?.nama_kelas || "-",
		},
		{
			accessorKey: "siswa.akun_siswa.jurusan.nama_jurusan",
			header: "Jurusan",
			cell: ({ row }) =>
				row.original?.siswa?.akun_siswa?.jurusan?.nama_jurusan || "-",
		},
		{
			accessorKey: "deskripsi",
			header: "Deskripsi",
		},
		{
			header: "Tunggakan",
			id: "tunggakan",
			cell: ({ row }) => {
				const total = parseFloat(row.original.total_jumlah) || 0;
				const dibayar = parseFloat(row.original.jumlah_bayar) || 0;
				const tunggakan = total - dibayar;
				return (
					<span className={tunggakan > 0 ? "text-red-600 font-semibold" : ""}>
						{formatToIDR(tunggakan)}
					</span>
				);
			},
		},
		{
			accessorKey: "jumlah_bayar",
			header: "Sudah Dibayar",
			cell: ({ row }) => formatToIDR(row.getValue("jumlah_bayar")),
		},
		{
			accessorKey: "status",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Status
						<ArrowUpDown />
					</Button>
				);
			},
			cell: ({ row }) => {
				const status = row.getValue("status");
				return <StatusBadge status={status} />;
			},
		},
		{
			id: "lihat_pembayaran",
			header: "Riwayat Bayar",
			cell: ({ row }) => {
				const bill = row.original;
				if (!bill.pembayaran || bill.pembayaran.length === 0) {
					return <span className="text-xs text-gray-500">Belum ada</span>;
				}
				return (
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								Lihat ({bill.pembayaran.length})
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[700px] max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									Riwayat Pembayaran: {bill.nomor_tagihan}
								</DialogTitle>
								<DialogDescription>
									Siswa: {bill.siswa?.nama} <br />
									Total Tagihan: {formatToIDR(bill.total_jumlah)} | Sudah
									Dibayar: {formatToIDR(bill.jumlah_bayar)}
								</DialogDescription>
							</DialogHeader>
							<ScrollArea className="h-[400px] w-full pr-4 mt-2">
								{bill.pembayaran
									.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
									.map((p, index) => (
										<div
											key={p.id || index}
											className="mb-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800"
										>
											<div className="flex justify-between items-start mb-1">
												<p className="font-semibold text-sm">
													Pembayaran Ke-{bill.pembayaran.length - index}
												</p>
												<Badge
													variant={
														p.sudah_verifikasi ? "default" : "destructive"
													}
													className={
														p.sudah_verifikasi ? "bg-green-500 text-white" : ""
													}
												>
													{p.sudah_verifikasi
														? "Terverifikasi"
														: "Belum Verifikasi"}
												</Badge>
											</div>
											<p className="text-sm">
												<strong>Tanggal:</strong>{" "}
												{new Date(p.createdAt).toLocaleDateString("id-ID", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
											<p className="text-sm">
												<strong>Jumlah:</strong> {formatToIDR(p.jumlah)}
											</p>
											<p className="text-sm">
												<strong>Metode:</strong>{" "}
												<span className="capitalize">
													{p.metode_pembayaran}
												</span>
											</p>
											{p.catatan && (
												<p className="text-sm mt-1">
													<strong>Catatan:</strong> {p.catatan}
												</p>
											)}
										</div>
									))}
							</ScrollArea>
							<DialogFooter>
								<DialogClose asChild>
									<Button type="button" variant="outline">
										Tutup
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				);
			},
		},
		{
			id: "actions",
			header: "Aksi",
			cell: ({ row }) => {
				const tagihan = row.original;
				return (
					<div className="flex items-center space-x-2">
						{tagihan.status?.toLowerCase() !== "paid" && (
							<Link href={`/dashboard/pembayaran/${tagihan.id}`}>
								<Button
									size="sm"
									className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"
								>
									Bayar
								</Button>
							</Link>
						)}
						<HapusPembayaran id={tagihan.id} onSuccess={refreshFilteredData} />
					</div>
				);
			},
		},
	];

	return (
		<div className="space-y-6 p-2 sm:p-4 md:p-6">
			<Card>
				<CardHeader>
					<CardTitle>Filter Data Pembayaran Siswa</CardTitle>
					<CardDescription>
						Masukkan nama siswa, pilih kelas, dan/atau jurusan untuk mencari
						data tagihan.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
						<Popover open={openNamaCommand} onOpenChange={setOpenNamaCommand}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={openNamaCommand}
									className="w-full justify-between text-sm text-left font-normal"
									disabled={isFetchingAll && uniqueNamaList.length === 0}
								>
									{namaQuery
										? uniqueNamaList.find(
												(nama) => nama.toLowerCase() === namaQuery.toLowerCase()
										  ) || namaQuery
										: "Ketik atau pilih nama..."}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
								<Command>
									<CommandInput
										placeholder="Cari nama siswa..."
										value={namaQuery}
										onValueChange={setNamaQuery}
										className="text-sm"
									/>
									<CommandList>
										<CommandEmpty>Nama tidak ditemukan.</CommandEmpty>
										<CommandGroup>
											{uniqueNamaList.map((nama) => (
												<CommandItem
													key={nama}
													value={nama}
													onSelect={(currentValue) => {
														setNamaQuery(
															currentValue.toLowerCase() ===
																namaQuery.toLowerCase()
																? ""
																: currentValue
														);
														setOpenNamaCommand(false);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															namaQuery.toLowerCase() === nama.toLowerCase()
																? "opacity-100"
																: "opacity-0"
														)}
													/>
													{nama}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>

						<Select
							value={kelasQuery}
							onValueChange={(value) =>
								setKelasQuery(value === "all-kelas" ? "" : value)
							}
							disabled={isFetchingAll && uniqueKelasList.length === 0}
						>
							<SelectTrigger className="text-sm w-full">
								<SelectValue placeholder="Pilih Kelas..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all-kelas">Semua Kelas</SelectItem>
								{uniqueKelasList.map((kelas) => (
									<SelectItem key={kelas} value={kelas}>
										{kelas}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={jurusanQuery}
							onValueChange={(value) =>
								setJurusanQuery(value === "all-jurusan" ? "" : value)
							}
							disabled={isFetchingAll && uniqueJurusanList.length === 0}
						>
							<SelectTrigger className="text-sm w-full">
								<SelectValue placeholder="Pilih Jurusan..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all-jurusan">Semua Jurusan</SelectItem>
								{uniqueJurusanList.map((jurusan) => (
									<SelectItem key={jurusan} value={jurusan}>
										{jurusan}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
						<Button
							onClick={handleSearch}
							disabled={isLoading || (isFetchingAll && !allTagihanData.length)}
							className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 w-full sm:w-auto"
						>
							{isLoading || (isFetchingAll && !allTagihanData.length) ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Search className="mr-2 h-4 w-4" />
							)}
							{isFetchingAll && !allTagihanData.length
								? "Memuat Data Awal..."
								: isLoading
								? "Mencari..."
								: "Cari Tagihan"}
						</Button>
						{(namaQuery || kelasQuery || jurusanQuery || hasSearched) && (
							<Button
								variant="outline"
								onClick={clearSearch}
								className="w-full sm:w-auto"
							>
								<X className="mr-2 h-4 w-4" />
								Bersihkan Filter
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{error && (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Oops!</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{isLoading && !error && !isFetchingAll && (
				<div className="flex justify-center items-center py-10">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
					<p className="ml-3 text-muted-foreground">
						Sedang mencari data tagihan...
					</p>
				</div>
			)}

			{hasSearched && !isLoading && filteredTagihan.length > 0 && (
				<div className="mt-6">
					<h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
						Hasil Pencarian Data Tagihan
					</h2>
					<TableView
						columns={columns}
						data={filteredTagihan}
						isLoading={isLoading}
						error={null}
						searchKey="nomor_tagihan"
						searchPlaceholder="Cari dalam hasil..."
						title="Data Tagihan Siswa"
					/>
				</div>
			)}

			{hasSearched && !isLoading && filteredTagihan.length === 0 && !error && (
				<Alert className="mt-6 bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300">
					<AlertTitle className="font-semibold">Informasi</AlertTitle>
					<AlertDescription>
						Tidak ada data tagihan yang ditemukan cocok dengan kriteria
						pencarian Anda.
					</AlertDescription>
				</Alert>
			)}

			{!hasSearched &&
				!isLoading &&
				!isFetchingAll &&
				!error &&
				filteredTagihan.length === 0 && (
					<Alert className="mt-6">
						<AlertTitle>Mulai Mencari</AlertTitle>
						<AlertDescription>
							Silakan masukkan kriteria di atas dan klik "Cari Tagihan" untuk
							menampilkan data.
						</AlertDescription>
					</Alert>
				)}
		</div>
	);
};

export default PageDataPembayaranSiswa;

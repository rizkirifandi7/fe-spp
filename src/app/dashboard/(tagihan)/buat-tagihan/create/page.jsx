"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
	CalendarIcon,
	Trash2,
	Users,
	User,
	Info,
	CreditCard,
	Plus,
	Check,
	ChevronsUpDown,
	IdCard,
	GraduationCap,
	Briefcase,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { getCookie } from "@/actions/cookies";

// Schema validasi
const siswaSchema = z.object({
	id_siswa: z.string().min(1, "Harus memilih siswa"),
	items: z
		.array(
			z.object({
				id_jenis_pembayaran: z
					.string()
					.min(1, "Harus memilih jenis pembayaran"),
				deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
				jumlah: z.number().min(1000, "Jumlah minimal Rp 1.000"),
				bulan: z.string().optional(),
				tahun: z.string().optional(),
				jatuh_tempo: z.date({ required_error: "Jatuh tempo harus diisi" }), // Added here
			})
		)
		.min(1, "Minimal ada 1 item tagihan"),
});

const kelasSchema = z.object({
	id_kelas: z.string().min(1, "Harus memilih kelas"),
	id_jurusan: z.string().min(1, "Harus memilih jurusan"),
	items: z
		.array(
			z.object({
				id_jenis_pembayaran: z
					.string()
					.min(1, "Harus memilih jenis pembayaran"),
				deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
				jumlah: z.number().min(1000, "Jumlah minimal Rp 1.000"),
				bulan: z.string().optional(),
				tahun: z.string().optional(),
				jatuh_tempo: z.date({ required_error: "Jatuh tempo harus diisi" }), // Added here
			})
		)
		.min(1, "Minimal ada 1 item tagihan"),
});

export default function CreateTagihanPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jenisParam = searchParams.get("jenis");

	const [isLoading, setIsLoading] = useState(false);
	const [siswaList, setSiswaList] = useState([]);
	const [kelasList, setKelasList] = useState([]);
	const [jenisPembayaran, setJenisPembayaran] = useState([]);
	const [jurusanList, setJurusanList] = useState([]);
	const [isFetching, setIsFetching] = useState(true);
	const [tabValue, setTabValue] = useState("per-siswa");
	const [selectedJenis, setSelectedJenis] = useState(null);
	const [openSiswaPopover, setOpenSiswaPopover] = useState(false);
	const [openKelasPopover, setOpenKelasPopover] = useState(false);
	const [openJurusanPopover, setOpenJurusanPopover] = useState(false);
	const [selectedSiswaDetails, setSelectedSiswaDetails] = useState(null);

	// Fungsi untuk mendapatkan nilai default berdasarkan jenis pembayaran
	const getDefaultValues = (isBulanan) => {
		const now = new Date();
		const defaultValues = {
			id_jenis_pembayaran: jenisParam || "",
			deskripsi: "",
			jumlah: 0,
			jatuh_tempo: new Date(), // Added default jatuh_tempo for each item
		};

		if (isBulanan) {
			return {
				...defaultValues,
				bulan: (now.getMonth() + 1).toString(),
				tahun: now.getFullYear().toString(),
			};
		}
		return defaultValues;
	};

	// Form untuk tagihan per siswa
	const siswaForm = useForm({
		resolver: zodResolver(siswaSchema),
		defaultValues: {
			id_siswa: "",
			items: [getDefaultValues(false)],
		},
	});

	// Form untuk tagihan per kelas
	const kelasForm = useForm({
		resolver: zodResolver(kelasSchema),
		defaultValues: {
			id_kelas: "",
			id_jurusan: "",
			items: [getDefaultValues(false)],
		},
	});

	const siswaFields = useFieldArray({
		control: siswaForm.control,
		name: "items",
	});

	const kelasFields = useFieldArray({
		control: kelasForm.control,
		name: "items",
	});

	// Fetch data awal
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsFetching(true);
				const token = (await getCookie("token"))?.value;
				const headers = { Authorization: `Bearer ${token}` };

				// Fetch data jenis pembayaran
				const jenisResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/jenis-pembayaran`,
					{ headers }
				);
				const jenisData = await jenisResponse.json();

				if (jenisData.status) {
					const formattedJenis = jenisData.data.map((item) => ({
						...item,
						isBulanan: item.nama.toLowerCase().includes("bulanan"),
					}));
					setJenisPembayaran(formattedJenis);

					// Set jenis pembayaran otomatis jika ada di URL
					if (jenisParam) {
						const jenis = formattedJenis.find(
							(j) => j.id.toString() === jenisParam
						);
						if (jenis) {
							setSelectedJenis(jenis);
							const isBulanan = jenis.isBulanan;

							// Update form values
							siswaForm.setValue(
								`items.0.id_jenis_pembayaran`,
								jenis.id.toString()
							);
							siswaForm.setValue(`items.0.deskripsi`, jenis.deskripsi);

							kelasForm.setValue(
								`items.0.id_jenis_pembayaran`,
								jenis.id.toString()
							);
							kelasForm.setValue(`items.0.deskripsi`, jenis.deskripsi);

							if (isBulanan) {
								const now = new Date();
								const currentMonth = (now.getMonth() + 1).toString();
								const currentYear = now.getFullYear().toString();

								siswaForm.setValue(`items.0.bulan`, currentMonth);
								kelasForm.setValue(`items.0.bulan`, currentMonth);
								siswaForm.setValue(`items.0.tahun`, currentYear);
								kelasForm.setValue(`items.0.tahun`, currentYear);
							}
						}
					}
				}

				// Fetch data lainnya (siswa, kelas, jurusan)
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

				if (siswaData.message === "Data siswa ditemukan") {
					setSiswaList(siswaData.data);
				}

				if (kelasData.message && kelasData.data) {
					setKelasList(kelasData.data);
				} else {
					setKelasList([]);
				}

				if (jurusanData.message === "Data ditemukan" && jurusanData.data) {
					setJurusanList(jurusanData.data);
				} else {
					setJurusanList([]);
				}
			} catch (error) {
				console.error("Fetch data error:", error);
				toast.error("Gagal memuat data awal.");
			} finally {
				setIsFetching(false);
			}
		};

		fetchData();
	}, [jenisParam]);

	// Handle jenis pembayaran change
	const handleJenisChange = (value, form, index) => {
		const jenis = jenisPembayaran.find((j) => j.id.toString() === value);
		setSelectedJenis(jenis);
		form.setValue(`items.${index}.id_jenis_pembayaran`, value);
		form.setValue(`items.${index}.deskripsi`, jenis?.deskripsi || "");

		if (!jenis?.isBulanan) {
			form.setValue(`items.${index}.bulan`, "");
			form.setValue(`items.${index}.tahun`, "");
		} else {
			const now = new Date();
			if (!form.getValues(`items.${index}.bulan`)) {
				form.setValue(`items.${index}.bulan`, (now.getMonth() + 1).toString());
			}
			if (!form.getValues(`items.${index}.tahun`)) {
				form.setValue(`items.${index}.tahun`, now.getFullYear().toString());
			}
		}
	};

	// Fungsi untuk menambahkan item baru
	const addItemRow = (fields, form) => {
		fields.append({
			...getDefaultValues(selectedJenis?.isBulanan),
			id_jenis_pembayaran: selectedJenis?.id.toString() || "",
			deskripsi: selectedJenis?.deskripsi || "",
		});
	};

	// Fungsi submit untuk per siswa
	const onSubmitPerSiswa = async (data) => {
		setIsLoading(true);
		try {
			const token = (await getCookie("token"))?.value;

			const firstItemPaymentTypeId = data.items[0].id_jenis_pembayaran;
			const paymentTypeDetails = jenisPembayaran.find(
				(jp) => jp.id.toString() === firstItemPaymentTypeId
			);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/tagihan`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						id_siswa: parseInt(data.id_siswa),
						id_jenis_pembayaran: parseInt(data.items[0].id_jenis_pembayaran), // Assuming this is for the main bill details
						deskripsi: paymentTypeDetails ? paymentTypeDetails.nama : "", // Corrected line
						items: data.items.map((item) => ({
							...item,
							id_jenis_pembayaran: parseInt(item.id_jenis_pembayaran),
							jumlah: Number(item.jumlah),
							bulan: item.bulan || null,
							tahun: item.tahun || null,
							jatuh_tempo: item.jatuh_tempo, // Ensure jatuh_tempo is passed for each item
						})),
					}),
				}
			);

			const result = await response.json();
			if (result.success) {
				toast.success("Tagihan berhasil dibuat");
				router.push("/dashboard/tunggakan");
			} else {
				throw new Error(result.error || "Gagal membuat tagihan");
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Fungsi submit untuk per kelas
	const onSubmitPerKelas = async (data) => {
		setIsLoading(true);
		try {
			const token = (await getCookie("token"))?.value;
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/tagihan/per-kelas`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						id_kelas: parseInt(data.id_kelas),
						id_jurusan: parseInt(data.id_jurusan),
						items: data.items.map((item) => ({
							...item,
							id_jenis_pembayaran: parseInt(item.id_jenis_pembayaran),
							jumlah: Number(item.jumlah),
							bulan: item.bulan || null,
							tahun: item.tahun || null,
							jatuh_tempo: item.jatuh_tempo, // Ensure jatuh_tempo is passed for each item
						})),
					}),
				}
			);

			const result = await response.json();
			if (result.success) {
				const jumlahSiswa = result.data?.length || 0;
				toast.success(
					`Tagihan berhasil dibuat untuk ${jumlahSiswa} siswa dalam kelas`
				);
				router.push("/dashboard/buat-tagihan");
			} else {
				throw new Error(result.error || "Gagal membuat tagihan");
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetching) {
		return (
			<div className="container mx-auto py-12 px-4 md:px-6 space-y-6">
				<Skeleton className="h-10 w-3/4 md:w-1/2" />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<Skeleton className="h-12 w-full rounded-lg" />
					<Skeleton className="h-12 w-full rounded-lg" />
				</div>
				<Skeleton className="h-12 w-1/3 md:w-1/4 rounded-lg" />
				<Skeleton className="h-72 w-full rounded-xl" />
			</div>
		);
	}

	// Komponen untuk item tagihan table
	const renderItemTable = (fields, form, isSiswa = true) => (
		<Table className="shadow-sm">
			<TableHeader className="bg-slate-100 dark:bg-slate-800/70">
				<TableRow className="border-slate-200 dark:border-slate-700">
					<TableHead className="text-slate-600 dark:text-slate-300 font-semibold">
						Jenis Pembayaran
					</TableHead>
					<TableHead className="text-slate-600 dark:text-slate-300 font-semibold">
						Deskripsi
					</TableHead>
					{selectedJenis?.isBulanan && (
						<>
							<TableHead className="text-slate-600 dark:text-slate-300 font-semibold">
								Bulan
							</TableHead>
							<TableHead className="text-slate-600 dark:text-slate-300 font-semibold">
								Tahun
							</TableHead>
						</>
					)}
					<TableHead className="text-slate-600 dark:text-slate-300 font-semibold">
						Jatuh Tempo
					</TableHead>
					<TableHead className="text-slate-600 dark:text-slate-300 font-semibold">
						Jumlah (Rp)
					</TableHead>
					<TableHead className="text-slate-600 dark:text-slate-300 font-semibold text-right">
						Aksi
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
				{fields.fields.map((field, index) => (
					<TableRow
						key={field.id}
						className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
					>
						<TableCell className="min-w-[200px]">
							<FormField
								control={form.control}
								name={`items.${index}.id_jenis_pembayaran`}
								render={({ field }) => (
									<FormItem>
										<Select
											onValueChange={(value) =>
												handleJenisChange(value, form, index)
											}
											value={field.value}
											disabled={!!jenisParam} // Disable jika ada jenisParam
										>
											<SelectTrigger className="bg-white dark:bg-slate-700 dark:border-slate-600">
												<SelectValue placeholder="Pilih jenis" />
											</SelectTrigger>
											<SelectContent className="dark:bg-slate-800">
												{jenisPembayaran.map((jenis) => (
													<SelectItem
														key={jenis.id}
														value={jenis.id.toString()}
														className="dark:focus:bg-slate-700"
													>
														{jenis.nama}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</TableCell>
						<TableCell className="min-w-[200px]">
							<FormField
								control={form.control}
								name={`items.${index}.deskripsi`}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												{...field}
												placeholder="Deskripsi tagihan"
												className="bg-white dark:bg-slate-700 dark:border-slate-600"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</TableCell>
						{selectedJenis?.isBulanan && (
							<>
								<TableCell className="min-w-[150px]">
									<FormField
										control={form.control}
										name={`items.${index}.bulan`}
										render={({ field }) => (
											<FormItem>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<SelectTrigger className="bg-white dark:bg-slate-700 dark:border-slate-600">
														<SelectValue placeholder="Pilih bulan" />
													</SelectTrigger>
													<SelectContent className="dark:bg-slate-800">
														{Array.from({ length: 12 }, (_, i) => i + 1).map(
															(month) => (
																<SelectItem
																	key={month}
																	value={month.toString()}
																	className="dark:focus:bg-slate-700"
																>
																	{new Date(0, month - 1).toLocaleString(
																		"id-ID",
																		{ month: "long" }
																	)}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</TableCell>
								<TableCell className="min-w-[120px]">
									<FormField
										control={form.control}
										name={`items.${index}.tahun`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														{...field}
														placeholder="Tahun"
														className="bg-white dark:bg-slate-700 dark:border-slate-600"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</TableCell>
							</>
						)}
						<TableCell className="min-w-[180px]">
							<FormField
								control={form.control}
								name={`items.${index}.jatuh_tempo`}
								render={({ field: itemField }) => (
									<FormItem>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className="w-full pl-3 text-left font-normal bg-white dark:bg-slate-700 dark:border-slate-600 h-10"
													>
														{itemField.value
															? format(itemField.value, "PPP", {
																	locale: id,
															  })
															: "Pilih tanggal"}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
												align="start"
											>
												<Calendar
													mode="single"
													selected={itemField.value}
													onSelect={itemField.onChange}
													disabled={(date) =>
														date < new Date(new Date().setHours(0, 0, 0, 0)) ||
														date > new Date("2900-01-01")
													}
													initialFocus
													className="dark:bg-slate-800"
													classNames={{
														day_selected: "dark:bg-emerald-600 dark:text-white",
														day_today: "dark:text-emerald-400",
													}}
													locale={id}
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</TableCell>
						<TableCell className="min-w-[150px]">
							<FormField
								control={form.control}
								name={`items.${index}.jumlah`}
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												{...field}
												type="number"
												onChange={(e) =>
													field.onChange(parseInt(e.target.value || 0))
												}
												placeholder="Jumlah"
												className="bg-white dark:bg-slate-700 dark:border-slate-600"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</TableCell>
						<TableCell className="text-right">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => fields.remove(index)}
								disabled={fields.fields.length <= 1}
								className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 dark:hover:bg-red-900/50 rounded-md"
							>
								<Trash2 className="h-5 w-5" />
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	return (
		<div className="min-h-screen  dark:from-slate-900 dark:to-sky-950 py-8">
			<div className="container mx-auto px-4 md:px-6 space-y-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
							Buat Tagihan Baru
						</h1>
						<p className="text-slate-600 dark:text-slate-400 mt-1">
							{selectedJenis
								? `Jenis Pembayaran: ${selectedJenis.nama}`
								: "Pilih jenis pembayaran untuk memulai"}
						</p>
					</div>
					{selectedJenis && (
						<Badge
							variant={selectedJenis?.isBulanan ? "default" : "secondary"}
							className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
								selectedJenis?.isBulanan
									? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100 border-emerald-300 dark:border-emerald-600"
									: "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 border-green-300 dark:border-green-600"
							}`}
						>
							{selectedJenis?.isBulanan ? "Bulanan" : "Bebas"}
						</Badge>
					)}
				</div>

				<Tabs
					value={tabValue}
					onValueChange={setTabValue}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg h-12">
						<TabsTrigger
							value="per-siswa"
							className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-slate-50 rounded-md data-[state=active]:shadow-sm transition-all"
						>
							<User className="h-5 w-5" /> Per Siswa
						</TabsTrigger>
						<TabsTrigger
							value="per-kelas"
							className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-slate-50 rounded-md data-[state=active]:shadow-sm transition-all"
						>
							<Users className="h-5 w-5" /> Per Kelas
						</TabsTrigger>
					</TabsList>

					{/* Form untuk tagihan per siswa */}
					<TabsContent value="per-siswa">
						<Card className="shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/30">
							<CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6">
								<CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-700 dark:text-slate-200">
									<CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />{" "}
									Tagihan Per Siswa
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<Form {...siswaForm}>
									<form
										onSubmit={siswaForm.handleSubmit(onSubmitPerSiswa)}
										className="space-y-8"
									>
										<div className="grid grid-cols-1 md:grid-cols-1 gap-6 items-start">
											<div>
												<FormField
													control={siswaForm.control}
													name="id_siswa"
													render={({ field }) => (
														<FormItem className="flex flex-col">
															<FormLabel className="text-slate-700 dark:text-slate-300">
																Siswa
															</FormLabel>
															<Popover
																open={openSiswaPopover}
																onOpenChange={setOpenSiswaPopover}
															>
																<PopoverTrigger asChild>
																	<FormControl>
																		<Button
																			variant="outline"
																			role="combobox"
																			aria-expanded={openSiswaPopover}
																			className={cn(
																				"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
																				!field.value && "text-muted-foreground"
																			)}
																		>
																			{field.value
																				? siswaList.find(
																						(siswa) =>
																							siswa.id.toString() ===
																							field.value
																				  )?.nama
																				: "Pilih siswa"}
																			<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																		</Button>
																	</FormControl>
																</PopoverTrigger>
																<PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-lg">
																	<Command>
																		<CommandInput placeholder="Cari siswa..." />
																		<CommandList>
																			<CommandEmpty>
																				Tidak ada siswa ditemukan.
																			</CommandEmpty>
																			<CommandGroup>
																				{siswaList.map((siswa) => (
																					<CommandItem
																						value={siswa.nama}
																						key={siswa.id}
																						onSelect={() => {
																							field.onChange(
																								siswa.id.toString()
																							);
																							setSelectedSiswaDetails(siswa);
																							setOpenSiswaPopover(false);
																						}}
																					>
																						<Check
																							className={cn(
																								"mr-2 h-4 w-4",
																								field.value ===
																									siswa.id.toString()
																									? "opacity-100"
																									: "opacity-0"
																							)}
																						/>
																						<div className="flex flex-col">
																							<span className="font-medium text-slate-800 dark:text-slate-100">
																								{siswa.nama}
																							</span>
																							<span className="text-xs text-slate-500 dark:text-slate-400">
																								{siswa.akun_siswa?.nisn} -{" "}
																								{
																									siswa.akun_siswa?.kelas
																										?.nama_kelas
																								}{" "}
																								-{" "}
																								{
																									siswa.akun_siswa?.jurusan
																										?.nama_jurusan
																								}
																							</span>
																						</div>
																					</CommandItem>
																				))}
																			</CommandGroup>
																		</CommandList>
																	</Command>
																</PopoverContent>
															</Popover>
															<FormMessage />
														</FormItem>
													)}
												/>
												{selectedSiswaDetails && (
													<Card className="mt-4 shadow-sm dark:bg-slate-800/60 dark:border-slate-700">
														<CardHeader className="pb-3 pt-4 px-4 bg-slate-50 dark:bg-slate-700/50 rounded-t-lg">
															<CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
																<User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
																Detail Siswa Terpilih
															</CardTitle>
														</CardHeader>
														<CardContent className="grid grid-cols-2 p-4 space-y-2 text-sm">
															<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
																<User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
																<span className="font-medium text-slate-700 dark:text-slate-200">
																	Nama:
																</span>
																{selectedSiswaDetails.nama}
															</div>
															<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
																<IdCard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
																<span className="font-medium text-slate-700 dark:text-slate-200">
																	NISN:
																</span>
																{selectedSiswaDetails.akun_siswa?.nisn || "-"}
															</div>
															<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
																<GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
																<span className="font-medium text-slate-700 dark:text-slate-200">
																	Kelas:
																</span>
																{selectedSiswaDetails.akun_siswa?.kelas
																	?.nama_kelas || "-"}
															</div>
															<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
																<Briefcase className="h-4 w-4 text-slate-500 dark:text-slate-400" />
																<span className="font-medium text-slate-700 dark:text-slate-200">
																	Jurusan:
																</span>
																{selectedSiswaDetails.akun_siswa?.jurusan
																	?.nama_jurusan || "-"}
															</div>
														</CardContent>
													</Card>
												)}
											</div>
										</div>

										<Separator className="dark:bg-slate-700" />

										<div className="space-y-6">
											<div className="flex justify-between items-center">
												<h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
													Item Tagihan
												</h3>
												<Button
													type="button"
													onClick={() => addItemRow(siswaFields, siswaForm)}
													className="text-sm bg-emerald-600 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2"
												>
													<Plus className="h-5 w-5" /> Tambah Item
												</Button>
											</div>

											<Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-lg p-4">
												<Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
												<AlertTitle className="font-semibold">
													Informasi Tagihan
												</AlertTitle>
												<AlertDescription className="text-sm">
													{selectedJenis?.isBulanan
														? "Tagihan bulanan memerlukan pengisian bulan dan tahun."
														: "Tagihan bebas tidak memerlukan periode bulan/tahun."}
												</AlertDescription>
											</Alert>

											<div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
												{renderItemTable(siswaFields, siswaForm)}
											</div>
										</div>

										<div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
											<Button
												type="button"
												variant="outline"
												onClick={() => router.push("/dashboard/buat-tagihan")}
												className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
											>
												Batal
											</Button>
											<Button
												type="submit"
												disabled={isLoading}
												className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold shadow-md"
											>
												{isLoading ? "Menyimpan..." : "Simpan Tagihan"}
											</Button>
										</div>
									</form>
								</Form>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Form untuk tagihan per kelas */}
					<TabsContent value="per-kelas">
						<Card className="shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/30">
							<CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6">
								<CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-700 dark:text-slate-200">
									<CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />{" "}
									Tagihan Per Kelas
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<Form {...kelasForm}>
									<form
										onSubmit={kelasForm.handleSubmit(onSubmitPerKelas)}
										className="space-y-8"
									>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
											<FormField
												control={kelasForm.control}
												name="id_kelas"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<FormLabel className="text-slate-700 dark:text-slate-300">
															Kelas
														</FormLabel>
														<Popover
															open={openKelasPopover}
															onOpenChange={setOpenKelasPopover}
														>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant="outline"
																		role="combobox"
																		aria-expanded={openKelasPopover}
																		className={cn(
																			"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
																			!field.value && "text-muted-foreground"
																		)}
																	>
																		{field.value
																			? kelasList.find(
																					(kelas) =>
																						kelas.id.toString() === field.value
																			  )?.nama_kelas
																			: "Pilih kelas"}
																		<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-lg">
																<Command>
																	<CommandInput placeholder="Cari kelas..." />
																	<CommandList>
																		<CommandEmpty>
																			Tidak ada kelas ditemukan.
																		</CommandEmpty>
																		<CommandGroup>
																			{kelasList.map((kelas) => (
																				<CommandItem
																					value={kelas.nama_kelas}
																					key={kelas.id}
																					onSelect={() => {
																						field.onChange(kelas.id.toString());
																						setOpenKelasPopover(false);
																					}}
																				>
																					<Check
																						className={cn(
																							"mr-2 h-4 w-4",
																							field.value ===
																								kelas.id.toString()
																								? "opacity-100"
																								: "opacity-0"
																						)}
																					/>
																					<span className="font-medium text-slate-800 dark:text-slate-100">
																						{kelas.nama_kelas}
																					</span>
																				</CommandItem>
																			))}
																		</CommandGroup>
																	</CommandList>
																</Command>
															</PopoverContent>
														</Popover>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={kelasForm.control}
												name="id_jurusan"
												render={({ field }) => (
													<FormItem className="flex flex-col">
														<FormLabel className="text-slate-700 dark:text-slate-300">
															Jurusan
														</FormLabel>
														<Popover
															open={openJurusanPopover}
															onOpenChange={setOpenJurusanPopover}
														>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant="outline"
																		role="combobox"
																		aria-expanded={openJurusanPopover}
																		className={cn(
																			"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
																			!field.value && "text-muted-foreground"
																		)}
																	>
																		{field.value
																			? jurusanList.find(
																					(jurusan) =>
																						jurusan.id.toString() ===
																						field.value
																			  )?.nama_jurusan
																			: "Pilih jurusan"}
																		<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-lg">
																<Command>
																	<CommandInput placeholder="Cari jurusan..." />
																	<CommandList>
																		<CommandEmpty>
																			Tidak ada jurusan ditemukan.
																		</CommandEmpty>
																		<CommandGroup>
																			{jurusanList.map((jurusan) => (
																				<CommandItem
																					value={jurusan.nama_jurusan}
																					key={jurusan.id}
																					onSelect={() => {
																						field.onChange(
																							jurusan.id.toString()
																						);
																						setOpenJurusanPopover(false);
																					}}
																				>
																					<Check
																						className={cn(
																							"mr-2 h-4 w-4",
																							field.value ===
																								jurusan.id.toString()
																								? "opacity-100"
																								: "opacity-0"
																						)}
																					/>
																					<div className="flex flex-col">
																						<span className="font-medium text-slate-800 dark:text-slate-100">
																							{jurusan.nama_jurusan}
																						</span>
																						<span className="text-xs text-slate-500 dark:text-slate-400">
																							Unit:{" "}
																							{jurusan.unit?.nama_unit || "-"}
																						</span>
																					</div>
																				</CommandItem>
																			))}
																		</CommandGroup>
																	</CommandList>
																</Command>
															</PopoverContent>
														</Popover>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<Separator className="dark:bg-slate-700" />

										<div className="space-y-6">
											<div className="flex justify-between items-center">
												<h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
													Item Tagihan
												</h3>
												<Button
													type="button"
													onClick={() => addItemRow(kelasFields, kelasForm)}
													className="text-sm bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2"
												>
													<Plus className="h-5 w-5" /> Tambah Item
												</Button>
											</div>

											<Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-lg p-4">
												<Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
												<AlertTitle className="font-semibold">
													Tagihan Massal
												</AlertTitle>
												<AlertDescription className="text-sm">
													Tagihan ini akan diterapkan ke semua siswa dalam kelas
													yang dipilih
													{selectedJenis?.isBulanan &&
														" dan memerlukan pengisian bulan/tahun."}
												</AlertDescription>
											</Alert>

											<div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
												{renderItemTable(kelasFields, kelasForm, false)}
											</div>
										</div>

										<div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
											<Button
												type="button"
												variant="outline"
												className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 cursor-pointer"
												onClick={() => router.push("/dashboard/buat-tagihan")}
											>
												Batal
											</Button>
											<Button
												type="submit"
												disabled={isLoading}
												className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold shadow-md cursor-pointer"
											>
												{isLoading
													? "Menyimpan..."
													: "Simpan Tagihan untuk Seluruh Kelas"}
											</Button>
										</div>
									</form>
								</Form>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

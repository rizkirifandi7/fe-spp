// app/dashboard/buat-tagihan/TagihanFormSiswa.jsx
"use client";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	CreditCard,
	Plus,
	Info,
	User,
	ChevronsUpDown,
	Check,
	IdCard,
	GraduationCap,
	Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TagihanItemTable } from "./tagihan-form-tabel";

export function TagihanFormSiswa({ hook }) {
	const {
		siswaForm,
		onSubmitPerSiswa,
		isLoading,
		router,
		siswaList,
		handleSelectSiswa,
		selectedSiswaDetails,
		openSiswaPopover,
		setOpenSiswaPopover,
		siswaFields,
		addItemRow,
		selectedJenis,
		jenisPembayaran,
		handleJenisChange,
		jenisParam,
	} = hook;

	return (
		<Card className="shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800/30">
			<CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6">
				<CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-700 dark:text-slate-200">
					<CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
																			siswa.id.toString() === field.value
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
																		onSelect={() => handleSelectSiswa(siswa)}
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				field.value === siswa.id.toString()
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
																				{siswa.akun_siswa?.kelas?.nama_kelas} -{" "}
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
										<CardContent className="grid grid-cols-2 p-4 gap-y-2 text-sm">
											<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 col-span-2">
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
												{selectedSiswaDetails.akun_siswa?.kelas?.nama_kelas ||
													"-"}
											</div>
											<div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 col-span-2">
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
									className="text-sm bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2"
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

							<TagihanItemTable
								fields={siswaFields}
								form={siswaForm}
								jenisPembayaran={jenisPembayaran}
								selectedJenis={selectedJenis}
								handleJenisChange={handleJenisChange}
								jenisParam={jenisParam}
							/>
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
	);
}

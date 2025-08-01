// app/dashboard/buat-tagihan/TagihanFormKelas.jsx
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
import { CreditCard, Plus, Info, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagihanItemTable } from "./tagihan-form-tabel";

export function TagihanFormKelas({ hook }) {
	const {
		kelasForm,
		onSubmitPerKelas,
		isLoading,
		router,
		kelasList,
		jurusanList,
		openKelasPopover,
		setOpenKelasPopover,
		openJurusanPopover,
		setOpenJurusanPopover,
		kelasFields,
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
														className={cn(
															"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value
															? kelasList.find(
																	(kelas) => kelas.id.toString() === field.value
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
																			field.value === kelas.id.toString()
																				? "opacity-100"
																				: "opacity-0"
																		)}
																	/>
																	{kelas.nama_kelas}
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
														className={cn(
															"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value
															? jurusanList.find(
																	(jurusan) =>
																		jurusan.id.toString() === field.value
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
																		field.onChange(jurusan.id.toString());
																		setOpenJurusanPopover(false);
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			field.value === jurusan.id.toString()
																				? "opacity-100"
																				: "opacity-0"
																		)}
																	/>
																	<div className="flex flex-col">
																		<span className="font-medium text-slate-800 dark:text-slate-100">
																			{jurusan.nama_jurusan}
																		</span>
																		<span className="text-xs text-slate-500 dark:text-slate-400">
																			Unit: {jurusan.unit?.nama_unit || "-"}
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
									className="text-sm bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-2"
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
									Tagihan ini akan diterapkan ke semua siswa dalam kelas dan
									jurusan yang dipilih
									{selectedJenis?.isBulanan &&
										" dan memerlukan pengisian bulan/tahun."}
								</AlertDescription>
							</Alert>

							<TagihanItemTable
								fields={kelasFields}
								form={kelasForm}
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
	);
}

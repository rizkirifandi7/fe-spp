// app/dashboard/buat-tagihan/TagihanItemTable.jsx
"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Trash2 } from "lucide-react";
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
	FormControl,
	FormField,
	FormItem,
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

export function TagihanItemTable({
	fields,
	form,
	jenisPembayaran,
	selectedJenis,
	handleJenisChange,
	jenisParam,
}) {
	return (
		<div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
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
												disabled={!!jenisParam}
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
															{jenis.deskripsi}
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
															date <
																new Date(new Date().setHours(0, 0, 0, 0)) ||
															date > new Date("2900-01-01")
														}
														initialFocus
														className="dark:bg-slate-800"
														classNames={{
															day_selected:
																"dark:bg-emerald-600 dark:text-white",
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
		</div>
	);
}

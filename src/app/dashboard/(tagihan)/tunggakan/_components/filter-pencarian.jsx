import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { CardContent } from "@/components/ui/card";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import {
	Command,
	CommandInput,
	CommandList,
	CommandItem,
	CommandEmpty,
	CommandGroup,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const FilterPencarian = ({
	siswaList,
	kelasList,
	jurusanList,
	filters,
	setFilters,
	resetFilters,
	openSiswaPopover,
	setOpenSiswaPopover,
	siswaSearchTerm,
	setSiswaSearchTerm,
}) => {
	return (
		<CardContent className="pt-0">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Filter Nama */}
				<div>
					<label
						htmlFor="namaSiswaPopoverButton"
						className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
					>
						Nama Siswa
					</label>
					<Popover open={openSiswaPopover} onOpenChange={setOpenSiswaPopover}>
						<PopoverTrigger asChild>
							<Button
								id="namaSiswaPopoverButton"
								variant="outline"
								role="combobox"
								aria-expanded={openSiswaPopover}
								className={cn(
									"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
									!filters.nama && "text-muted-foreground"
								)}
							>
								{filters.nama
									? siswaList.find((siswa) => siswa.nama === filters.nama)
											?.nama || "Pilih siswa"
									: "Pilih siswa"}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-lg">
							<Command>
								<CommandInput
									placeholder="Cari siswa..."
									value={siswaSearchTerm}
									onValueChange={setSiswaSearchTerm}
								/>
								<CommandList>
									<CommandEmpty>Tidak ada siswa ditemukan.</CommandEmpty>
									<CommandGroup>
										{siswaList
											.filter((siswa) => {
												const searchTerm = siswaSearchTerm.trim().toLowerCase();
												if (searchTerm === "") return true;
												return (
													siswa.nama &&
													typeof siswa.nama === "string" &&
													siswa.nama.toLowerCase().includes(searchTerm)
												);
											})
											.map((siswa) => (
												<CommandItem
													key={siswa.id}
													value={siswa.nama}
													onSelect={() => {
														setFilters({
															...filters,
															nama: siswa.nama,
														});
														setOpenSiswaPopover(false);
														setSiswaSearchTerm("");
													}}
													className="cursor-pointer dark:text-slate-200 dark:hover:bg-slate-600"
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															filters.nama === siswa.nama
																? "opacity-100"
																: "opacity-0"
														)}
													/>
													<span>{siswa.nama}</span>
												</CommandItem>
											))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
				{/* Filter Kelas */}
				<div>
					<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
						Kelas
					</label>
					<Select
						value={filters.kelas}
						onValueChange={(value) => setFilters({ ...filters, kelas: value })}
					>
						<SelectTrigger
							className={cn(
								"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
								!filters.kelas && "text-muted-foreground"
							)}
						>
							<SelectValue placeholder="Pilih Kelas" />
						</SelectTrigger>
						<SelectContent className="dark:bg-slate-800">
							{kelasList.map((kelas) => (
								<SelectItem
									key={kelas.id}
									value={kelas.id.toString()}
									className="dark:focus:bg-green-900/30"
								>
									{kelas.nama_kelas}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{/* Filter Jurusan */}
				<div>
					<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
						Jurusan
					</label>
					<Select
						value={filters.jurusan}
						onValueChange={(value) =>
							setFilters({ ...filters, jurusan: value })
						}
					>
						<SelectTrigger
							className={cn(
								"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
								!filters.jurusan && "text-muted-foreground"
							)}
						>
							<SelectValue placeholder="Pilih Jurusan" />
						</SelectTrigger>
						<SelectContent className="dark:bg-slate-800">
							{jurusanList.map((jurusan) => (
								<SelectItem
									key={jurusan.id}
									value={jurusan.id.toString()}
									className="dark:focus:bg-green-900/30"
								>
									{jurusan.nama_jurusan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{/* Filter Status */}
				<div>
					<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
						Status Tagihan
					</label>
					<Select
						value={filters.status}
						onValueChange={(value) => setFilters({ ...filters, status: value })}
					>
						<SelectTrigger
							className={cn(
								"w-full justify-between bg-white dark:bg-slate-700/50 dark:border-slate-600 h-11 px-3 font-normal rounded-lg shadow-sm hover:shadow-md transition-shadow",
								!filters.status && "text-muted-foreground"
							)}
						>
							<SelectValue placeholder="Pilih Status" />
						</SelectTrigger>
						<SelectContent className="dark:bg-slate-800">
							<SelectItem value="all" className="dark:focus:bg-green-900/30">
								Semua Status
							</SelectItem>
							<SelectItem value="paid" className="dark:focus:bg-green-900/30">
								Lunas
							</SelectItem>
							<SelectItem
								value="pending"
								className="dark:focus:bg-green-900/30"
							>
								Menunggu
							</SelectItem>
							<SelectItem
								value="belum_lunas"
								className="dark:focus:bg-green-900/30"
							>
								Belum Lunas
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<Button
					variant="outline"
					onClick={resetFilters}
					className="bg-emerald-600 text-white dark:text-green-400 border-slate-200 dark:border-green-800 hover:bg-white dark:hover:bg-green-900/30"
				>
					Reset Filter
				</Button>
			</div>
		</CardContent>
	);
};

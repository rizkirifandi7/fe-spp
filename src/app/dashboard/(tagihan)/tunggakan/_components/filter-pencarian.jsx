// app/dashboard/.../_components/FilterPencarian.jsx
import React, { useState } from "react";
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
}) => {
	// State untuk UI internal komponen ini, tidak perlu diketahui parent.
	const [openSiswaPopover, setOpenSiswaPopover] = useState(false);
	const [siswaSearchTerm, setSiswaSearchTerm] = useState("");

	// Handler internal untuk setiap perubahan filter
	const handleSelectChange = (key, value) => {
		setFilters({ ...filters, [key]: value });
	};

	const handleSiswaSelect = (nama) => {
		setFilters({ ...filters, nama });
		setOpenSiswaPopover(false);
		setSiswaSearchTerm("");
	};

	return (
		<CardContent className="pt-0">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Filter Nama Siswa */}
				<div>
					<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
						Nama Siswa
					</label>
					<Popover open={openSiswaPopover} onOpenChange={setOpenSiswaPopover}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								className="w-full justify-between font-normal"
							>
								{filters.nama || "Pilih siswa"}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
							<Command>
								<CommandInput
									placeholder="Cari siswa..."
									value={siswaSearchTerm}
									onValueChange={setSiswaSearchTerm}
								/>
								<CommandList>
									<CommandEmpty>Tidak ada siswa ditemukan.</CommandEmpty>
									<CommandGroup>
										{siswaList.map((siswa) => (
											<CommandItem
												key={siswa.id}
												value={siswa.nama}
												onSelect={() => handleSiswaSelect(siswa.nama)}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														filters.nama === siswa.nama
															? "opacity-100"
															: "opacity-0"
													)}
												/>
												{siswa.nama}
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
						onValueChange={(value) => handleSelectChange("kelas", value)}
						className="w-full"
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Pilih Kelas" />
						</SelectTrigger>
						<SelectContent>
							{kelasList.map((kelas) => (
								<SelectItem key={kelas.id} value={kelas.id.toString()}>
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
						onValueChange={(value) => handleSelectChange("jurusan", value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Pilih Jurusan" />
						</SelectTrigger>
						<SelectContent>
							{jurusanList.map((jurusan) => (
								<SelectItem key={jurusan.id} value={jurusan.id.toString()}>
									{jurusan.nama_jurusan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Filter Status */}
				<div>
					<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
						Status
					</label>
					<Select
						value={filters.status}
						onValueChange={(value) => handleSelectChange("status", value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Pilih Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua Status</SelectItem>
							<SelectItem value="paid">Lunas</SelectItem>
							<SelectItem value="belum_lunas">Belum Lunas</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="flex justify-end mt-4">
				<Button variant="outline" onClick={resetFilters} className={"bg-emerald-600 text-white"}>
					Reset Filter
				</Button>
			</div>
		</CardContent>
	);
};

// app/dashboard/.../_components/FilterPembayaran.jsx
"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Search, X, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const FilterPembayaran = ({
	namaQuery,
	setNamaQuery,
	kelasQuery,
	setKelasQuery,
	jurusanQuery,
	setJurusanQuery,
	uniqueFilterLists,
	handleSearch,
	clearSearch,
	isLoading,
	isFetchingAll,
	hasSearched,
}) => {
	const [openNamaCommand, setOpenNamaCommand] = useState(false);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Filter Data Pembayaran Siswa</CardTitle>
				<CardDescription>
					Cari data tagihan berdasarkan nama, kelas, atau jurusan.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					<Popover open={openNamaCommand} onOpenChange={setOpenNamaCommand}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								className="w-full justify-between font-normal"
								disabled={isFetchingAll}
							>
								{namaQuery || "Pilih nama..."}{" "}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
							<Command>
								<CommandInput
									placeholder="Cari nama siswa..."
									value={namaQuery}
									onValueChange={setNamaQuery}
								/>
								<CommandList>
									<CommandEmpty>Nama tidak ditemukan.</CommandEmpty>
									<CommandGroup>
										{uniqueFilterLists.nama.map((nama) => (
											<CommandItem
												key={nama}
												value={nama}
												onSelect={() => {
													setNamaQuery(nama);
													setOpenNamaCommand(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														namaQuery === nama ? "opacity-100" : "opacity-0"
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
						onValueChange={(v) => setKelasQuery(v === "all-kelas" ? "" : v)}
						disabled={isFetchingAll}
					>
						<SelectTrigger className={"w-full"}>
							<SelectValue placeholder="Pilih Kelas..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all-kelas">Semua Kelas</SelectItem>
							{uniqueFilterLists.kelas.map((k) => (
								<SelectItem key={k} value={k}>
									{k}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={jurusanQuery}
						onValueChange={(v) => setJurusanQuery(v === "all-jurusan" ? "" : v)}
						disabled={isFetchingAll}
					>
						<SelectTrigger className={"w-full"}>
							<SelectValue placeholder="Pilih Jurusan..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all-jurusan">Semua Jurusan</SelectItem>
							{uniqueFilterLists.jurusan.map((j) => (
								<SelectItem key={j} value={j}>
									{j}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={handleSearch}
						disabled={isLoading || isFetchingAll}
						className={"bg-emerald-600 text-white"}
					>
						{isLoading || isFetchingAll ? (
							<Loader2 className="mr-0.5 h-4 w-4 animate-spin" />
						) : (
							<Search className="mr-0.5 h-4 w-4" />
						)}
						{isFetchingAll
							? "Memuat..."
							: isLoading
							? "Mencari..."
							: "Cari Tagihan"}
					</Button>
					{(namaQuery || kelasQuery || jurusanQuery || hasSearched) && (
						<Button variant="outline" onClick={clearSearch}>
							<X className="mr-2 h-4 w-4" />
							Bersihkan
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

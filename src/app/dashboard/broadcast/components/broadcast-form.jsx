"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";

// Schema validasi
const BroadcastSchema = z.object({
	unit: z.string().min(1, "Unit harus dipilih"),
	pesan: z
		.string()
		.min(1, "Pesan tidak boleh kosong")
		.max(1000, "Pesan terlalu panjang"),
	siswaTerpilih: z.array(z.string()).optional(),
	kirimKeSemua: z.boolean().default(false),
});

const BroadcastWhatsApp = () => {
	const [units, setUnits] = useState([]);
	const [siswas, setSiswas] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(false);

	const form = useForm({
		resolver: zodResolver(BroadcastSchema),
		defaultValues: {
			unit: "",
			pesan: "",
			siswaTerpilih: [],
			kirimKeSemua: false,
		},
	});

	// Fetch data unit
	useEffect(() => {
		const fetchUnits = async () => {
			try {
				setLoadingData(true);
				const response = await fetch("http://localhost:8010/unit");
				const data = await response.json();
				setUnits(data.data);
			} catch (error) {
				toast.error("Gagal memuat data unit");
			} finally {
				setLoadingData(false);
			}
		};
		fetchUnits();
	}, []);

	// Fetch data siswa ketika unit berubah
	useEffect(() => {
		const unitId = form.watch("unit");
		if (unitId) {
			const fetchSiswas = async () => {
				try {
					setLoadingData(true);
					const response = await fetch(
						`http://localhost:8010/akun/siswa?unit=${unitId}`
					);
					const data = await response.json();
					setSiswas(data.data);
				} catch (error) {
					toast.error("Gagal memuat data siswa");
				} finally {
					setLoadingData(false);
				}
			};
			fetchSiswas();
		}
	}, [form.watch("unit")]);

	// Handle submit
	const onSubmit = async (data) => {
		try {
			setLoading(true);

			// Filter siswa yang akan dikirim
			let penerima = [];
			if (data.kirimKeSemua) {
				penerima = siswas.map((siswa) => siswa.telepon);
			} else {
				penerwa = siswas
					.filter((siswa) => data.siswaTerpilih.includes(siswa.id.toString()))
					.map((siswa) => siswa.telepon);
			}

			// Kirim ke WhatsApp API
			const hasilPengiriman = await Promise.all(
				penerima.map(async (telepon) => {
					try {
						const whatsappUrl = `https://wa.me/${telepon}?text=${encodeURIComponent(
							data.pesan
						)}`;

						// Buka tab baru untuk setiap pengiriman (simulasi)
						window.open(whatsappUrl, "_blank");

						return { telepon, status: "sukses" };
					} catch (error) {
						return { telepon, status: "gagal", error: error.message };
					}
				})
			);

			// Hitung statistik
			const sukses = hasilPengiriman.filter(
				(r) => r.status === "sukses"
			).length;
			const gagal = hasilPengiriman.filter((r) => r.status === "gagal").length;

			toast.success(`Broadcast berhasil! ${sukses} terkirim, ${gagal} gagal`);
		} catch (error) {
			toast.error("Gagal mengirim broadcast: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Broadcast</h2>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{/* Pilih Unit */}
					<FormField
						control={form.control}
						name="unit"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Unit Sekolah</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
									disabled={loadingData}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Pilih unit sekolah" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{units.map((unit) => (
											<SelectItem key={unit.id} value={unit.id.toString()}>
												{unit.nama_unit}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Pilih Siswa */}
					{form.watch("unit") && (
						<div className="space-y-2">
							<FormField
								control={form.control}
								name="kirimKeSemua"
								render={({ field }) => (
									<FormItem className="flex items-center space-x-2">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<FormLabel>Kirim ke semua siswa di unit ini</FormLabel>
									</FormItem>
								)}
							/>

							{!form.watch("kirimKeSemua") && (
								<FormField
									control={form.control}
									name="siswaTerpilih"
									render={() => (
										<FormItem>
											<FormLabel>Pilih Siswa</FormLabel>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
												{siswas.map((siswa) => (
													<FormField
														key={siswa.id}
														control={form.control}
														name="siswaTerpilih"
														render={({ field }) => (
															<FormItem className="flex items-center space-x-2">
																<FormControl>
																	<Checkbox
																		checked={field.value?.includes(
																			siswa.id.toString()
																		)}
																		onCheckedChange={(checked) => {
																			return checked
																				? field.onChange([
																						...field.value,
																						siswa.id.toString(),
																				  ])
																				: field.onChange(
																						field.value?.filter(
																							(value) =>
																								value !== siswa.id.toString()
																						)
																				  );
																		}}
																	/>
																</FormControl>
																<FormLabel className="font-normal">
																	{siswa.nama} - {siswa.telepon}
																</FormLabel>
															</FormItem>
														)}
													/>
												))}
											</div>
											<FormDescription>
												Pilih siswa yang akan menerima broadcast
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>
					)}

					{/* Isi Pesan */}
					<FormField
						control={form.control}
						name="pesan"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Isi Pesan</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Tulis pesan broadcast..."
										className="min-h-[120px]"
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Pesan akan dikirim ke nomor WhatsApp siswa
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" disabled={loading || loadingData}>
						{loading ? "Mengirim..." : "Kirim Broadcast"}
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default BroadcastWhatsApp;

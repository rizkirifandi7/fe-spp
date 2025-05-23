"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react"; // Added Trash2 for delete icon
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // For hapus_gambar

// Schema validasi menggunakan Zod
const sekolahSchema = z.object({
	nama_sekolah: z.string().min(3, "Nama sekolah minimal 3 karakter"),
	alamat: z.string().min(10, "Alamat terlalu pendek"),
	telepon: z.string().min(8, "Nomor telepon tidak valid"),
	email: z.string().email("Email tidak valid").or(z.literal("")).optional(),
	website: z.string().url("Website tidak valid").or(z.literal("")).optional(),
	pemilik: z.string().min(3, "Pemilik minimal 3 karakter"),
	gambar: z.any().optional(), // For the file input
	hapus_gambar: z.boolean().optional(), // For the checkbox
});

export default function UpdateSekolah() {
	const [sekolah, setSekolah] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [imagePreview, setImagePreview] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentImageFile, setCurrentImageFile] = useState(null); // To store the selected file

	const {
		register,
		handleSubmit,
		reset,
		setValue, // To set form values programmatically
		watch, // To watch form values
		formState: { errors },
	} = useForm({
		resolver: zodResolver(sekolahSchema),
		defaultValues: {
			nama_sekolah: "",
			alamat: "",
			telepon: "",
			email: "",
			website: "",
			pemilik: "",
			gambar: undefined,
			hapus_gambar: false,
		},
	});

	const hapusGambarCheckbox = watch("hapus_gambar");

	// Fetch data sekolah
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Assuming there's only one school record or you have a specific ID
				// If you always update a specific ID (e.g., ID 1), use that.
				// For this example, I'll fetch all and take the first one.
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/sekolah`
				);
				// Adjust if your API for a single school record is different
				const data = response.data.data[0];
				if (data) {
					setSekolah(data);
					reset({
						nama_sekolah: data.nama_sekolah || "",
						alamat: data.alamat || "",
						telepon: data.telepon || "",
						email: data.email || "",
						website: data.website || "",
						pemilik: data.pemilik || "",
						hapus_gambar: false, // Reset checkbox
					});
					setImagePreview(null); // Clear preview on data load
					setCurrentImageFile(null); // Clear selected file
				} else {
					toast.error("Data sekolah tidak ditemukan.");
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				toast.error("Gagal memuat data sekolah");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [reset]);

	// Handle image preview and store the file
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		setCurrentImageFile(file); // Store the selected file
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
			setValue("hapus_gambar", false); // Uncheck hapus_gambar if new image is selected
		} else {
			setImagePreview(null);
		}
	};

	const handleRemoveImage = () => {
		setImagePreview(null);
		setCurrentImageFile(null);
		const imageInputElement = document.getElementById("logo");
		if (imageInputElement) {
			imageInputElement.value = ""; // Clear the file input
		}
		// If there was an existing image from the server, mark it for deletion
		if (sekolah && sekolah.gambar) {
			setValue("hapus_gambar", true);
		}
	};

	// Handle form submission
	const onSubmitForm = async (data) => {
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("nama_sekolah", data.nama_sekolah);
			formData.append("alamat", data.alamat);
			formData.append("telepon", data.telepon);
			formData.append("email", data.email || "");
			formData.append("website", data.website || "");
			formData.append("pemilik", data.pemilik);

			if (currentImageFile) {
				formData.append("gambar", currentImageFile);
				// If a new image is uploaded, hapus_gambar should not be true
				formData.append("hapus_gambar", "false");
			} else if (data.hapus_gambar && sekolah && sekolah.gambar) {
				formData.append("hapus_gambar", "true");
			}

			const response = await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/sekolah/${sekolah.id}`,
				formData,
				{
					headers: {
						// Content-Type is automatically set by browser for FormData
					},
				}
			);

			toast.success("Data sekolah berhasil diperbarui");
			setSekolah(response.data.data); // Update local state with new data from backend
			reset(response.data.data); // Reset form with new data
			setImagePreview(null); // Clear preview
			setCurrentImageFile(null); // Clear selected file
			setValue("hapus_gambar", false); // Reset checkbox
		} catch (error) {
			console.error(
				"Error updating data:",
				error.response?.data || error.message
			);
			toast.error(
				error.response?.data?.message || "Gagal memperbarui data sekolah"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
			</div>
		);
	}

	if (!sekolah) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Card className="p-6 text-center max-w-md">
					<p className="text-gray-600">
						Data sekolah tidak ditemukan. Silakan coba lagi atau hubungi
						administrator.
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<Card className="max-w-4xl mx-auto overflow-hidden">
				<div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6">
					<h1 className="text-2xl font-bold text-white">Update Data Sekolah</h1>
					<p className="text-emerald-100 mt-1">
						Perbarui informasi sekolah Anda
					</p>
				</div>

				<div className="p-6">
					<form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Kolom Kiri */}
							<div className="space-y-4">
								<div>
									<Label htmlFor="nama_sekolah" className="mb-2">
										Nama Sekolah *
									</Label>
									<Input
										{...register("nama_sekolah")}
										id="nama_sekolah"
										type="text"
										className={`${errors.nama_sekolah ? "border-red-500" : ""}`}
										placeholder="Masukkan nama sekolah"
									/>
									{errors.nama_sekolah && (
										<p className="mt-1 text-sm text-red-600">
											{errors.nama_sekolah.message}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="alamat" className="mb-2">
										Alamat *
									</Label>
									<Textarea
										{...register("alamat")}
										id="alamat"
										rows={3}
										className={`${errors.alamat ? "border-red-500" : ""}`}
										placeholder="Masukkan alamat lengkap"
									/>
									{errors.alamat && (
										<p className="mt-1 text-sm text-red-600">
											{errors.alamat.message}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="telepon" className="mb-2">
										Telepon *
									</Label>
									<Input
										{...register("telepon")}
										id="telepon"
										type="tel"
										className={`${errors.telepon ? "border-red-500" : ""}`}
										placeholder="Masukkan nomor telepon"
									/>
									{errors.telepon && (
										<p className="mt-1 text-sm text-red-600">
											{errors.telepon.message}
										</p>
									)}
								</div>
							</div>

							{/* Kolom Kanan */}
							<div className="space-y-4">
								<div>
									<Label htmlFor="email" className="mb-2">
										Email
									</Label>
									<Input
										{...register("email")}
										id="email"
										type="email"
										className={`${errors.email ? "border-red-500" : ""}`}
										placeholder="Masukkan email sekolah"
									/>
									{errors.email && (
										<p className="mt-1 text-sm text-red-600">
											{errors.email.message}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="website" className="mb-2">
										Website
									</Label>
									<Input
										{...register("website")}
										id="website"
										type="url"
										className={`${errors.website ? "border-red-500" : ""}`}
										placeholder="https://example.com"
									/>
									{errors.website && (
										<p className="mt-1 text-sm text-red-600">
											{errors.website.message}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="pemilik" className="mb-2">
										Pemilik *
									</Label>
									<Input
										{...register("pemilik")}
										id="pemilik"
										type="text"
										className={`${errors.pemilik ? "border-red-500" : ""}`}
										placeholder="Masukkan pemilik sekolah"
									/>
									{errors.pemilik && (
										<p className="mt-1 text-sm text-red-600">
											{errors.pemilik.message}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="logo" className="mb-2">
										Logo Sekolah
									</Label>
									<div className="flex items-center gap-4">
										<div className="relative h-20 w-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
											{imagePreview ? (
												<img
													src={imagePreview}
													alt="Preview"
													className="h-full w-full object-cover"
												/>
											) : sekolah && sekolah.gambar ? (
												// Display image from Cloudinary URL
												<img
													src={sekolah.gambar} // Directly use the Cloudinary URL
													alt="Logo Sekolah"
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="h-full w-full flex items-center justify-center text-gray-400">
													<span className="text-xs">No image</span>
												</div>
											)}
										</div>
										<div className="flex-1">
											<input
												id="logo"
												type="file"
												accept="image/*"
												// {...register("gambar")} // react-hook-form doesn't handle file inputs directly well for controlled state
												onChange={handleImageChange}
												className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
												disabled={hapusGambarCheckbox}
											/>
											{(imagePreview ||
												(sekolah && sekolah.gambar && !currentImageFile)) &&
												!hapusGambarCheckbox && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="mt-2 text-red-600 hover:text-red-700"
														onClick={handleRemoveImage}
													>
														<Trash2 className="h-4 w-4 mr-1" />
														Hapus Gambar
													</Button>
												)}
										</div>
									</div>
									<div className="mt-2 flex items-center space-x-2">
										<Checkbox
											id="hapus_gambar"
											{...register("hapus_gambar")}
											checked={hapusGambarCheckbox}
											onCheckedChange={(checked) => {
												setValue("hapus_gambar", checked);
												if (checked) {
													setImagePreview(null); // Clear preview if deleting
													setCurrentImageFile(null); // Clear selected file
													const imageInputElement =
														document.getElementById("logo");
													if (imageInputElement) {
														imageInputElement.value = "";
													}
												}
											}}
											disabled={!!currentImageFile} // Disable if a new image is selected
										/>
										<Label
											htmlFor="hapus_gambar"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Hapus gambar saat ini (jika ada dan tidak memilih gambar
											baru)
										</Label>
									</div>
									{errors.gambar && (
										<p className="mt-1 text-sm text-red-600">
											{errors.gambar.message}
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									if (sekolah) {
										reset({
											nama_sekolah: sekolah.nama_sekolah || "",
											alamat: sekolah.alamat || "",
											telepon: sekolah.telepon || "",
											email: sekolah.email || "",
											website: sekolah.website || "",
											pemilik: sekolah.pemilik || "",
											hapus_gambar: false,
										});
										setImagePreview(null);
										setCurrentImageFile(null);
										const imageInputElement = document.getElementById("logo");
										if (imageInputElement) {
											imageInputElement.value = "";
										}
									}
								}}
								disabled={isSubmitting}
							>
								Reset Form
							</Button>
							<Button
								type="submit"
								className="bg-emerald-600 hover:bg-emerald-700"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Memproses...
									</>
								) : (
									"Simpan Perubahan"
								)}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	);
}

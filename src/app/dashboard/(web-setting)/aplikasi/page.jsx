"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Schema validasi menggunakan Zod
const sekolahSchema = z.object({
	nama_sekolah: z.string().min(3, "Nama sekolah minimal 3 karakter"),
	alamat: z.string().min(10, "Alamat terlalu pendek"),
	telepon: z.string().min(8, "Nomor telepon tidak valid"),
	email: z.string().email("Email tidak valid").or(z.literal("")),
	website: z.string().url("Website tidak valid").or(z.literal("")),
	pemilik: z.string().min(3, "Pemilik minimal 3 karakter"),
});

export default function UpdateSekolah() {
	const [sekolah, setSekolah] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [imagePreview, setImagePreview] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(sekolahSchema),
	});

	// Fetch data sekolah
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get("http://localhost:8010/sekolah");
				const data = response.data.data[0];
				setSekolah(data);
				reset(data); // Set form values
				setIsLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				toast.error("Gagal memuat data sekolah");
				setIsLoading(false);
			}
		};

		fetchData();
	}, [reset]);

	// Handle image preview
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle form submission
	const onSubmit = async (data) => {
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			for (const key in data) {
				if (data[key] !== null && data[key] !== undefined) {
					formData.append(key, data[key]);
				}
			}

			// Tambahkan gambar jika ada
			const imageInput = document.querySelector('input[type="file"]');
			if (imageInput.files[0]) {
				formData.append("gambar", imageInput.files[0]);
			}

			const response = await axios.put(
				`http://localhost:8010/sekolah/${sekolah.id}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			toast.success("Data sekolah berhasil diperbarui");
			setSekolah(response.data.data);
		} catch (error) {
			console.error("Error updating data:", error);
			toast.error("Gagal memperbarui data sekolah");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!sekolah) {
		return (
			<div className="text-center py-10">
				<p className="text-gray-500">Data sekolah tidak ditemukan</p>
			</div>
		);
	}

	return (
		<Card className="w-full p-6 bg-white rounded-md shadow">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">
				Update Data Sekolah
			</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Kolom Kiri */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nama Sekolah *
							</label>
							<input
								{...register("nama_sekolah")}
								type="text"
								className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.nama_sekolah ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="Masukkan nama sekolah"
							/>
							{errors.nama_sekolah && (
								<p className="mt-1 text-sm text-red-600">
									{errors.nama_sekolah.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Alamat *
							</label>
							<textarea
								{...register("alamat")}
								rows={3}
								className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.alamat ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="Masukkan alamat lengkap"
							/>
							{errors.alamat && (
								<p className="mt-1 text-sm text-red-600">
									{errors.alamat.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Telepon *
							</label>
							<input
								{...register("telepon")}
								type="tel"
								className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.telepon ? "border-red-500" : "border-gray-300"
								}`}
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
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								{...register("email")}
								type="email"
								className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.email ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="Masukkan email sekolah"
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Website
							</label>
							<input
								{...register("website")}
								type="url"
								className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.website ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="https://example.com"
							/>
							{errors.website && (
								<p className="mt-1 text-sm text-red-600">
									{errors.website.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Pemilik *
							</label>
							<input
								{...register("pemilik")}
								type="text"
								className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.pemilik ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="Masukkan pemilik sekolah"
							/>
							{errors.pemilik && (
								<p className="mt-1 text-sm text-red-600">
									{errors.pemilik.message}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Logo Sekolah
							</label>
							<div className="flex items-center space-x-4">
								<div className="flex-shrink-0">
									{imagePreview ? (
										<img
											src={imagePreview}
											alt="Preview"
											className="h-16 w-16 rounded-md object-cover"
										/>
									) : sekolah.gambar ? (
										<img
											src={`http://localhost:8010/uploads/${sekolah.gambar}`}
											alt="Logo Sekolah"
											className="h-16 w-16 rounded-md object-cover"
										/>
									) : (
										<div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
											<span className="text-xs text-gray-500">No image</span>
										</div>
									)}
								</div>
								<div className="flex-1">
									<input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						onClick={() => reset(sekolah)}
					>
						Reset
					</button>
					<Button
						type="submit"
						disabled={isSubmitting}
						className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? (
							<span className="flex items-center">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Memproses...
							</span>
						) : (
							"Simpan Perubahan"
						)}
					</Button>
				</div>
			</form>
		</Card>
	);
}

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const DetailSiswaPage = () => {
	const [siswa, setSiswa] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { id } = useParams();
	const router = useRouter();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa/${id}`
				);

				console.log("Response data:", response.data.data); 
				setSiswa(response.data.data);
				setError(null);
			} catch (err) {
				console.error("Error fetching siswa data:", err);
				setError("Gagal memuat data siswa");
				toast.error("Gagal memuat data siswa");
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchData();
		}
	}, [id]);

	const formatDate = (dateString) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return "-";

		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();

		return `${day}-${month}-${year}`;
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-10">
				<p className="text-red-500">{error}</p>
				<Button
					onClick={() => router.back()}
					className="mt-4"
					variant="outline"
				>
					Kembali
				</Button>
			</div>
		);
	}

	if (!siswa) {
		return (
			<div className="text-center py-10">
				<p className="text-gray-500">Data siswa tidak ditemukan</p>
				<Button
					onClick={() => router.back()}
					className="mt-4"
					variant="outline"
				>
					Kembali
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Detail Siswa</h1>
				<Button onClick={() => router.back()} variant="outline">
					Kembali
				</Button>
			</div>

			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				{/* Header dengan foto profil */}
				<div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
					<div className="flex items-center space-x-6">
						<div className="relative h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
							{siswa.gambar ? (
								<Image
									src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${siswa.gambar}`}
									alt={`Foto ${siswa.nama}`}
									layout="fill"
									objectFit="cover"
								/>
							) : (
								<div className="flex items-center justify-center h-full w-full bg-gray-300">
									<span className="text-gray-500 text-lg font-medium">
										{siswa.nama.charAt(0).toUpperCase()}
									</span>
								</div>
							)}
						</div>
						<div>
							<h2 className="text-2xl font-bold">{siswa.nama}</h2>
							<p className="text-blue-100">{siswa.akun_siswa?.nisn}</p>
							<p className="text-blue-100 mt-1">
								{siswa.akun_siswa?.kelas?.nama_kelas} -{" "}
								{siswa.akun_siswa?.jurusan?.nama_jurusan}
							</p>
						</div>
					</div>
				</div>

				{/* Informasi Siswa */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
					{/* Kolom Kiri - Data Pribadi */}
					<div className="space-y-6">
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
								Data Pribadi
							</h3>
							<div className="space-y-3">
								<InfoItem label="NISN" value={siswa.akun_siswa?.nisn || "-"} />
								<InfoItem label="NIK" value={siswa.akun_siswa?.nik || "-"} />
								<InfoItem label="Email" value={siswa.email || "-"} />
								<InfoItem label="Telepon" value={siswa.telepon || "-"} />
								<InfoItem
									label="Tempat/Tanggal Lahir"
									value={`${
										siswa.akun_siswa?.tempat_lahir || "-"
									}, ${formatDate(siswa.akun_siswa.tgl_lahir)}`}
								/>
								<InfoItem label="Umur" value={siswa.akun_siswa?.umur || "-"} />
								<InfoItem
									label="Jenis Kelamin"
									value={siswa.akun_siswa?.jenis_kelamin || "-"}
								/>
								<InfoItem
									label="Alamat"
									value={siswa.alamat || "-"}
									multiline
								/>
							</div>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
								Informasi Khusus
							</h3>
							<div className="space-y-3">
								<InfoItem
									label="Disabilitas"
									value={siswa.akun_siswa?.disabilitas || "-"}
								/>
								<InfoItem
									label="Kebutuhan Khusus"
									value={siswa.akun_siswa?.kebutuhan_khusus || "-"}
								/>
								<InfoItem
									label="No. KIP"
									value={siswa.akun_siswa?.no_kip || "-"}
								/>
							</div>
						</div>
					</div>

					{/* Kolom Kanan - Data Keluarga dan Sekolah */}
					<div className="space-y-6">
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
								Data Keluarga
							</h3>
							<div className="space-y-3">
								<InfoItem
									label="Nama Ayah"
									value={siswa.akun_siswa?.nama_ayah || "-"}
								/>
								<InfoItem
									label="Nama Ibu"
									value={siswa.akun_siswa?.nama_ibu || "-"}
								/>
								<InfoItem
									label="Nama Wali"
									value={siswa.akun_siswa?.nama_wali || "-"}
								/>
							</div>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
								Informasi Sekolah
							</h3>
							<div className="space-y-3">
								<InfoItem
									label="Unit"
									value={siswa.akun_siswa?.unit?.nama_unit || "-"}
								/>
								<InfoItem
									label="Kelas"
									value={siswa.akun_siswa?.kelas?.nama_kelas || "-"}
								/>
								<InfoItem
									label="Jurusan"
									value={siswa.akun_siswa?.jurusan?.nama_jurusan || "-"}
								/>
								<InfoItem
									label="Status"
									value={
										<span
											className={`px-2 py-1 rounded text-xs font-medium ${
												siswa.status === "on"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{siswa.status.toUpperCase()}
										</span>
									}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Komponen untuk menampilkan informasi dalam format label:value
const InfoItem = ({ label, value, multiline = false }) => {
	return (
		<div>
			<p className="text-sm font-medium text-gray-500">{label}</p>
			{multiline ? (
				<p className="mt-1 text-sm text-gray-800 whitespace-pre-line">
					{value}
				</p>
			) : (
				<p className="mt-1 text-sm text-gray-800">{value}</p>
			)}
		</div>
	);
};

export default DetailSiswaPage;

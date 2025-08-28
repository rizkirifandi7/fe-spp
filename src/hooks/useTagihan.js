// src/hooks/useTagihan.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getCookie } from "@/actions/cookies";

// Schema validasi
const itemSchema = z.object({
	id_jenis_pembayaran: z.string().min(1, "Harus memilih jenis pembayaran"),
	deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
	jumlah: z.number().min(1000, "Jumlah minimal Rp 1.000"), // Menggunakan coerce untuk konversi otomatis
	bulan: z.string().optional(),
	tahun: z.string().optional(),
	jatuh_tempo: z.date({ required_error: "Jatuh tempo harus diisi" }),
});

const siswaSchema = z.object({
	id_siswa: z.string().min(1, "Harus memilih siswa"),
	items: z.array(itemSchema).min(1, "Minimal ada 1 item tagihan"),
});

const kelasSchema = z.object({
	id_kelas: z.string().min(1, "Harus memilih kelas"),
	id_jurusan: z.string().min(1, "Harus memilih jurusan"),
	items: z.array(itemSchema).min(1, "Minimal ada 1 item tagihan"),
});

export function useTagihan() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jenisParam = searchParams.get("jenis");

	// States
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [siswaList, setSiswaList] = useState([]);
	const [kelasList, setKelasList] = useState([]);
	const [jenisPembayaran, setJenisPembayaran] = useState([]);
	const [jurusanList, setJurusanList] = useState([]);
	const [selectedJenis, setSelectedJenis] = useState(null);
	const [selectedSiswaDetails, setSelectedSiswaDetails] = useState(null);
	const [openSiswaPopover, setOpenSiswaPopover] = useState(false);
	const [openKelasPopover, setOpenKelasPopover] = useState(false);
	const [openJurusanPopover, setOpenJurusanPopover] = useState(false);

	// Fungsi untuk mendapatkan nilai default
	const getDefaultValues = (isBulanan) => {
		const now = new Date();
		return {
			id_jenis_pembayaran: jenisParam || "",
			deskripsi: "",
			jumlah: 0,
			jatuh_tempo: new Date(),
			...(isBulanan && {
				bulan: (now.getMonth() + 1).toString(),
				tahun: now.getFullYear().toString(),
			}),
		};
	};

	// Form untuk siswa
	const siswaForm = useForm({
		resolver: zodResolver(siswaSchema),
		defaultValues: { id_siswa: "", items: [getDefaultValues(false)] },
	});

	// Form untuk kelas
	const kelasForm = useForm({
		resolver: zodResolver(kelasSchema),
		defaultValues: {
			id_kelas: "",
			id_jurusan: "",
			items: [getDefaultValues(false)],
		},
	});

	// Field array untuk siswa
	const siswaFields = useFieldArray({
		control: siswaForm.control,
		name: "items",
	});

	// Field array untuk kelas
	const kelasFields = useFieldArray({
		control: kelasForm.control,
		name: "items",
	});

	// Fetch data jenis-pembayaran, akun-siswa, kelas, dan jurusan
	const fetchData = async () => {
		try {
			setIsFetching(true);
			const token = (await getCookie("token"))?.value;
			const headers = { Authorization: `Bearer ${token}` };

			const [jenisRes, siswaRes, kelasRes, jurusanRes] = await Promise.all([
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/jenis-pembayaran`, {
					headers,
				}),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa`, { headers }),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas`, { headers }),
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/jurusan`, { headers }),
			]);

			const [jenisData, siswaData, kelasData, jurusanData] = await Promise.all([
				jenisRes.json(),
				siswaRes.json(),
				kelasRes.json(),
				jurusanRes.json(),
			]);

			if (jenisData.status) {
				const formattedJenis = jenisData.data.map((item) => ({
					...item,
					isBulanan: item.nama.toLowerCase().includes("bulanan"),
				}));
				setJenisPembayaran(formattedJenis);
				if (jenisParam) {
					const jenis = formattedJenis.find(
						(j) => j.id.toString() === jenisParam
					);
					if (jenis) {
						setSelectedJenis(jenis);
						const now = new Date();
						const currentMonth = (now.getMonth() + 1).toString();
						const currentYear = now.getFullYear().toString();
						[siswaForm, kelasForm].forEach((form) => {
							form.setValue("items.0.id_jenis_pembayaran", jenis.id.toString());
							form.setValue("items.0.deskripsi", jenis.deskripsi);
							if (jenis.isBulanan) {
								form.setValue("items.0.bulan", currentMonth);
								form.setValue("items.0.tahun", currentYear);
							}
						});
					}
				}
			}

			if (siswaData.message === "Data siswa ditemukan") setSiswaList(siswaData.data);
			if (kelasData.message && kelasData.data) setKelasList(kelasData.data);
			if (jurusanData.message === "Data ditemukan" && jurusanData.data)
				setJurusanList(jurusanData.data);
		} catch (error) {
			console.error("Fetch data error:", error);
			toast.error("Gagal memuat data awal.");
		} finally {
			setIsFetching(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [jenisParam]);

	// Fungsi untuk mengubah jenis pembayaran
	const handleJenisChange = (value, form, index) => {
		const jenis = jenisPembayaran.find((j) => j.id.toString() === value);
		setSelectedJenis(jenis);
		form.setValue(`items.${index}.id_jenis_pembayaran`, value);
		form.setValue(`items.${index}.deskripsi`, jenis?.deskripsi || "");
		if (!jenis?.isBulanan) {
			form.setValue(`items.${index}.bulan`, "");
			form.setValue(`items.${index}.tahun`, "");
		} else {
			const now = new Date();
			if (!form.getValues(`items.${index}.bulan`)) {
				form.setValue(`items.${index}.bulan`, (now.getMonth() + 1).toString());
			}
			if (!form.getValues(`items.${index}.tahun`)) {
				form.setValue(`items.${index}.tahun`, now.getFullYear().toString());
			}
		}
	};

	// Fungsi untuk menambahkan item tagihan
	const addItemRow = (fields, form) => {
		fields.append({
			...getDefaultValues(selectedJenis?.isBulanan),
			id_jenis_pembayaran: selectedJenis?.id.toString() || "",
			deskripsi: selectedJenis?.deskripsi || "",
		});
	};

	// Fungsi untuk mengirim tagihan
	const submitTagihan = async (url, data) => {
		setIsLoading(true);
		try {
			const token = (await getCookie("token"))?.value;
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			const result = await response.json();
			if (result.status === true) {
				toast.success("Tagihan berhasil dibuat");
				router.push(
					url.includes("per-kelas")
						? "/dashboard/buat-tagihan"
						: "/dashboard/tunggakan"
				);
			} else {
				throw new Error(result.error || "Gagal membuat tagihan");
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Fungsi untuk mengirim tagihan per siswa
	const onSubmitPerSiswa = (data) => {
		const firstItemPaymentTypeId = data.items[0].id_jenis_pembayaran;
		const paymentTypeDetails = jenisPembayaran.find(
			(jp) => jp.id.toString() === firstItemPaymentTypeId
		);
		submitTagihan(`${process.env.NEXT_PUBLIC_API_URL}/tagihan/per-siswa`, {
			id_siswa: parseInt(data.id_siswa),
			id_jenis_pembayaran: parseInt(firstItemPaymentTypeId),
			deskripsi: paymentTypeDetails ? paymentTypeDetails.nama : "",
			items: data.items.map((item) => ({
				...item,
				id_jenis_pembayaran: parseInt(item.id_jenis_pembayaran),
				jumlah: Number(item.jumlah),
				bulan: item.bulan || null,
				tahun: item.tahun || null,
				jatuh_tempo: item.jatuh_tempo,
			})),
		});
	};

	// Fungsi untuk mengirim tagihan per kelas
	const onSubmitPerKelas = (data) => {
		submitTagihan(`${process.env.NEXT_PUBLIC_API_URL}/tagihan/per-kelas`, {
			id_kelas: parseInt(data.id_kelas),
			id_jurusan: parseInt(data.id_jurusan),
			items: data.items.map((item) => ({
				...item,
				id_jenis_pembayaran: parseInt(item.id_jenis_pembayaran),
				jumlah: Number(item.jumlah),
				bulan: item.bulan || null,
				tahun: item.tahun || null,
				jatuh_tempo: item.jatuh_tempo,
			})),
		});
	};

	// Fungsi memilih siswa
	const handleSelectSiswa = (siswa) => {
		siswaForm.setValue("id_siswa", siswa.id.toString());
		setSelectedSiswaDetails(siswa);
		setOpenSiswaPopover(false);
	};

	return {
		router,
		isLoading,
		isFetching,
		jenisParam,
		siswaList,
		kelasList,
		jurusanList,
		jenisPembayaran,
		selectedJenis,
		selectedSiswaDetails,
		siswaForm,
		kelasForm,
		siswaFields,
		kelasFields,
		handleJenisChange,
		addItemRow,
		onSubmitPerSiswa,
		onSubmitPerKelas,
		handleSelectSiswa,
		openSiswaPopover,
		setOpenSiswaPopover,
		openKelasPopover,
		setOpenKelasPopover,
		openJurusanPopover,
		setOpenJurusanPopover,
	};
}

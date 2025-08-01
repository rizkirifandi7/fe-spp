// src/hooks/usePembayaran.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/actions/cookies";
import { toast } from "sonner";

const sendWhatsAppNotification = async (pembayaranData) => {
	const { siswa, tagihan, formData, selectedItems } = pembayaranData;

	// 1. Pastikan nomor telepon ada
	if (!siswa?.telepon) {
		console.warn(
			"Nomor telepon siswa tidak ditemukan, notifikasi WhatsApp dilewati."
		);
		return;
	}

	// 2. Dapatkan deskripsi item yang baru saja dibayar
	const paidItemsDescriptions = tagihan.item_tagihan
		.filter((item) => selectedItems.includes(item.id))
		.map(
			(item) =>
				`- ${item.deskripsi} (${new Intl.NumberFormat("id-ID", {
					style: "currency",
					currency: "IDR",
					minimumFractionDigits: 0,
				}).format(item.jumlah)})`
		)
		.join("\n");

	// 3. Susun pesan notifikasi
	const message = `
✅ *Pembayaran Berhasil Diterima*

Yth. Bapak/Ibu Wali dari Ananda *${siswa.nama}*
Kelas: *${siswa.akun_siswa.kelas.nama_kelas}*

Kami konfirmasi bahwa kami telah menerima pembayaran untuk tagihan *${
		tagihan.nomor_tagihan
	}* dengan rincian:

*Jumlah Dibayar:* ${new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(formData.jumlah)}
*Metode:* ${
		formData.metode_pembayaran.charAt(0).toUpperCase() +
		formData.metode_pembayaran.slice(1)
	}
*Tanggal:* ${new Date().toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	})}

*Item yang Dibayar:*
${paidItemsDescriptions}

Terima kasih atas pembayaran Anda.

Hormat kami,
*Tim Keuangan Sekolah*
  `.trim();

	// 4. Format nomor telepon & siapkan data untuk API Fonnte
	const targetTelepon = siswa.telepon.startsWith("0")
		? `62${siswa.telepon.substring(1)}`
		: siswa.telepon;
	const fonnteFormData = new FormData();
	fonnteFormData.append("target", targetTelepon);
	fonnteFormData.append("message", message);

	// 5. Kirim ke Fonnte (dengan error handling)
	try {
		const response = await fetch("https://api.fonnte.com/send", {
			method: "POST",
			headers: { Authorization: process.env.NEXT_PUBLIC_TOKEN_FONNTE },
			body: fonnteFormData,
		});
		const result = await response.json();
		if (!response.ok || result.status === false) {
			throw new Error(result.reason || "Gagal mengirim notifikasi.");
		}
		toast.info("Notifikasi WhatsApp berhasil dikirim.");
	} catch (error) {
		console.error("WhatsApp notification failed:", error);
		// Gagal kirim notifikasi tidak boleh menghentikan alur sukses pembayaran
		toast.warning(
			"Pembayaran berhasil, namun notifikasi WhatsApp gagal terkirim."
		);
	}
};

export const usePembayaran = (idTagihan) => {
	const router = useRouter();

	// States
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [tagihan, setTagihan] = useState(null);
	const [siswa, setSiswa] = useState(null);
	const [selectedItems, setSelectedItems] = useState([]);
	const [formData, setFormData] = useState({
		jumlah: "",
		metode_pembayaran: "tunai",
		catatan: "",
	});

	// Fetch data
	useEffect(() => {
		const fetchData = async () => {
			if (!idTagihan) return;
			try {
				setIsLoading(true);
				const token = (await getCookie("token"))?.value;
				const headers = { Authorization: `Bearer ${token}` };

				const tagihanResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/tagihan/${idTagihan}`
				);
				const tagihanData = await tagihanResponse.json();

				if (tagihanData.success) {
					setTagihan(tagihanData.data);
					const siswaResponse = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa/${tagihanData.data.id_siswa}`,
						{ headers }
					);
					const siswaData = await siswaResponse.json();
					if (siswaData.data) setSiswa(siswaData.data);
				} else {
					toast.error("Data tagihan tidak ditemukan.");
				}
			} catch (error) {
				toast.error("Gagal memuat data.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [idTagihan]);

	// Kalkulasi total (dioptimalkan dengan useMemo)
	const totals = useMemo(() => {
		if (!tagihan) return { totalUnpaid: 0, selectedTotal: 0, unpaidItems: [] };

		const unpaidItems = tagihan.item_tagihan.filter(
			(item) => item.status === "unpaid"
		);
		const totalUnpaid = unpaidItems.reduce(
			(sum, item) => sum + parseFloat(item.jumlah),
			0
		);
		const selectedTotal = unpaidItems
			.filter((item) => selectedItems.includes(item.id))
			.reduce((sum, item) => sum + parseFloat(item.jumlah), 0);

		return { totalUnpaid, selectedTotal, unpaidItems }; 
	}, [tagihan, selectedItems]);

	// Update jumlah di form secara otomatis ketika item dipilih
	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			jumlah: totals.selectedTotal > 0 ? totals.selectedTotal.toString() : "",
		}));
	}, [totals.selectedTotal]);

	// Handlers
	const handleItemSelect = useCallback((itemId) => {
		setSelectedItems((prev) =>
			prev.includes(itemId)
				? prev.filter((id) => id !== itemId)
				: [...prev, itemId]
		);
	}, []);

	const handleSelectAll = useCallback(() => {
		if (selectedItems.length === totals.unpaidItems.length) {
			setSelectedItems([]);
		} else {
			setSelectedItems(totals.unpaidItems.map((item) => item.id));
		}
	}, [selectedItems.length, totals.unpaidItems]);

	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	}, []);

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault();
			setIsSubmitting(true);
			try {
				const token = (await getCookie("token"))?.value;
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/tagihan/bayar/${idTagihan}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							...formData,
							jumlah: parseFloat(formData.jumlah),
							item_dibayar: selectedItems,
						}),
					}
				);
				const result = await response.json();
				if (!result.success)
					throw new Error(result.error || "Gagal melakukan pembayaran");

				toast.success("Pembayaran berhasil diproses!");
				sendWhatsAppNotification({ siswa, tagihan, formData, selectedItems });
				router.push(`/dashboard/pembayaran`);
			} catch (error) {
				toast.error("Pembayaran gagal", { description: error.message });
			} finally {
				setIsSubmitting(false);
			}
		},
		[formData, selectedItems, idTagihan, router]
	);

	return {
		isLoading,
		isSubmitting,
		tagihan,
		siswa,
		selectedItems,
		formData,
		totals,
		handleItemSelect,
		handleSelectAll,
		handleInputChange,
		handleSubmit,
		router,
	};
};

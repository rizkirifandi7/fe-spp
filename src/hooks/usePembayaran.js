// src/hooks/usePembayaran.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/actions/cookies";
import { toast } from "sonner";

// ...existing code...
const sendWhatsAppNotification = async (pembayaranData) => {
	const { siswa, tagihan, formData, selectedItems } = pembayaranData;

	if (!siswa?.telepon) {
		console.warn(
			"Nomor telepon siswa tidak ditemukan, notifikasi WhatsApp dilewati."
		);
		return;
	}

	// Ambil item yang dibayar
	const paidItems = tagihan.item_tagihan.filter((item) =>
		selectedItems.includes(item.id)
	);
	const pembayaranTerakhir = tagihan.pembayaran?.length
		? tagihan.pembayaran[tagihan.pembayaran.length - 1]
		: null;

	// Format tanggal
	const formatTanggal = (dateStr) => {
		if (!dateStr) return "-";
		const date = new Date(dateStr);
		return date.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	};

	// Buat detail item yang dibayar
	const itemDetails = paidItems
		.map(
			(item) =>
				`🧾 Deskripsi: ${item.deskripsi}\n` +
				`💰 Jumlah: ${new Intl.NumberFormat("id-ID", {
					style: "currency",
					currency: "IDR",
					minimumFractionDigits: 0,
				}).format(item.jumlah)}\n` +
				`Terbit tanggal : ${formatTanggal(item.createdAt)}\n` +
				`Dibayar tanggal: ${formatTanggal(pembayaranTerakhir?.createdAt)}\n` +
				`Telah BERHASIL kami terima.`
		)
		.join("\n\n");

	// Buat link detail pembayaran
	const detailUrl = `https://www.ypimadaarululum.web.id/id=${
		tagihan.id
	}/item-tagihan=${paidItems[0]?.id || ""}`;

	// Status tagihan
	const statusTagihan = tagihan.status === "paid" ? "Paid" : tagihan.status;

	// Susun pesan
	const message = `
Assalamu’alaikum Wr. Wb.
Yth. Wali dari siswa ${siswa.nama}
Kelas: ${siswa.akun_siswa.kelas.nama_kelas}

Pembayaran untuk item:
${itemDetails}

Berikut adalah rincian tagihan induk (${tagihan.nomor_tagihan}):

Tanggal Terbit: ${formatTanggal(tagihan.createdAt)}
Tanggal Tenggat: ${formatTanggal(paidItems[0]?.jatuh_tempo)}
Total Tagihan: ${new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(tagihan.total_jumlah)}
Total Terbayar: ${new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(tagihan.jumlah_bayar)}
Status: ${statusTagihan === "Paid" ? "Lunas" : "Belum Lunas"}
Detail Pembayaran : ${detailUrl}

Terima kasih telah melakukan pembayaran.
Semoga Allah SWT senantiasa memberikan kemudahan dan keberkahan.

Hormat kami,
Staf TU, MA Daarul Ulum.
    `.trim();

	const targetTelepon = siswa.telepon.startsWith("0")
		? `62${siswa.telepon.substring(1)}`
		: siswa.telepon;
	const fonnteFormData = new FormData();
	fonnteFormData.append("target", targetTelepon);
	fonnteFormData.append("message", message);

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
		toast.warning(
			"Pembayaran berhasil, namun notifikasi WhatsApp gagal terkirim."
		);
	}
};
// ...existing code...

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

				// Fetch ulang data tagihan setelah pembayaran
				const tagihanResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/tagihan/${idTagihan}`
				);
				const tagihanData = await tagihanResponse.json();
				const updatedTagihan = tagihanData.success ? tagihanData.data : tagihan;

				toast.success("Pembayaran berhasil diproses!");
				sendWhatsAppNotification({
					siswa,
					tagihan: updatedTagihan,
					formData,
					selectedItems,
				});
				router.push(`/dashboard/pembayaran`);
			} catch (error) {
				toast.error("Pembayaran gagal", { description: error.message });
			} finally {
				setIsSubmitting(false);
			}
		},
		[formData, selectedItems, idTagihan, router, siswa, tagihan]
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

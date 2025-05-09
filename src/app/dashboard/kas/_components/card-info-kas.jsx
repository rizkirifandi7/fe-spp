"use client";

import {
	Card,
	CardTitle,
	CardDescription,
	CardHeader,
	CardContent,
} from "@/components/ui/card";
import {
	ArrowDownCircle,
	ArrowUpCircle,
	Wallet,
	Loader2,
	AlertTriangle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatToIDR } from "@/lib/formatIdr";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StatCard = ({
	title,
	value,
	description,
	icon,
	colorClass,
	isLoading,
}) => {
	const IconComponent = icon;
	if (isLoading) {
		return (
			<Card className="w-full shadow-sm rounded-xl">
				<CardHeader className="pb-2">
					<CardDescription>{title}</CardDescription>
					<CardTitle className="text-2xl font-bold h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-xs text-muted-foreground h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full shadow-sm rounded-xl hover:shadow-xl transition-shadow duration-300">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardDescription className="font-medium">{title}</CardDescription>
				<IconComponent
					className={`h-5 w-5 ${colorClass || "text-muted-foreground"}`}
				/>
			</CardHeader>
			<CardContent>
				<div className={`text-2xl font-bold ${colorClass}`}>
					{formatToIDR(value)}
				</div>
				<p className="text-xs text-muted-foreground pt-1">{description}</p>
			</CardContent>
		</Card>
	);
};

const CardInfoKas = ({ refreshKey }) => {
	const [kasData, setKasData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/kas`
				);
				setKasData(response.data.data || []);
			} catch (err) {
				console.error("Error fetching kas data:", err);
				setError(
					err.response?.data?.message ||
						err.message ||
						"Gagal mengambil data kas."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [refreshKey]);

	const totalMasuk = kasData
		.filter((item) => item.tipe === "masuk")
		.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);

	const totalKeluar = kasData
		.filter((item) => item.tipe === "keluar")
		.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);

	const saldoAkhir = totalMasuk - totalKeluar;

	const countMasuk = kasData.filter((item) => item.tipe === "masuk").length;
	const countKeluar = kasData.filter((item) => item.tipe === "keluar").length;

	if (error && !loading) {
		return (
			<Alert variant="destructive" className="w-full">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-3 sm:grid-cols-1 w-full">
			<StatCard
				title="Total Pemasukan"
				value={totalMasuk}
				description={`${countMasuk} transaksi masuk`}
				icon={ArrowDownCircle}
				colorClass="text-emerald-600 dark:text-emerald-500"
				isLoading={loading}
			/>
			<StatCard
				title="Total Pengeluaran"
				value={totalKeluar}
				description={`${countKeluar} transaksi keluar`}
				icon={ArrowUpCircle}
				colorClass="text-red-600 dark:text-red-500"
				isLoading={loading}
			/>
			<StatCard
				title="Saldo Akhir"
				value={saldoAkhir}
				description="Total saldo kas saat ini"
				icon={Wallet}
				colorClass="text-blue-600 dark:text-blue-500"
				isLoading={loading}
			/>
		</div>
	);
};

export default CardInfoKas;

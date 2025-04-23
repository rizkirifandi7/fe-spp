"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardTitle,
	CardDescription,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

const CardInfoKas = ({ refreshKey }) => {
	const [kasData, setKasData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("http://localhost:8010/kas");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setKasData(data.data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An unknown error occurred"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [refreshKey]);

	// Calculate totals
	const totalMasuk = kasData
		.filter((item) => item.tipe === "masuk")
		.reduce((sum, item) => sum + item.jumlah, 0);

	const totalKeluar = kasData
		.filter((item) => item.tipe === "keluar")
		.reduce((sum, item) => sum + item.jumlah, 0);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className="flex gap-4 w-full">
			<Card className="w-full shadow rounded-md">
				<CardHeader className="relative">
					<CardDescription>Total Masuk</CardDescription>
					<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
						Rp{totalMasuk.toLocaleString()}
					</CardTitle>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{kasData.filter((item) => item.tipe === "masuk").length} transaksi{" "}
						<TrendingUpIcon className="size-4" />
					</div>
				</CardFooter>
			</Card>
			<Card className="w-full shadow rounded-md">
				<CardHeader className="relative">
					<CardDescription>Total Keluar</CardDescription>
					<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
						Rp{totalKeluar.toLocaleString()}
					</CardTitle>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{kasData.filter((item) => item.tipe === "keluar").length} transaksi{" "}
						<TrendingUpIcon className="size-4" />
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default CardInfoKas;

"use client";

import React, { useEffect, useState } from "react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

const CardInfoPPDB = ({ refreshKey }) => {
	const [stats, setStats] = useState({
		total: 0,
		verification: 0,
		rejected: 0,
		accepted: 0,
		paid: 0,
		unpaid: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/daftar-ppdb`
				);
				const data = await response.json();

				if (data.message === "Data ditemukan") {
					const registrations = data.data;

					const statusCounts = registrations.reduce(
						(acc, curr) => {
							acc.total++;

							// Hitung status pendaftaran
							if (curr.status === "verification") acc.verification++;
							if (curr.status === "rejected") acc.rejected++;
							if (curr.status === "accepted") acc.accepted++;

							// Hitung status pembayaran
							if (curr.status_pembayaran === "paid") acc.paid++;
							if (curr.status_pembayaran === "unpaid") acc.unpaid++;

							return acc;
						},
						{
							total: 0,
							verification: 0,
							rejected: 0,
							accepted: 0,
							paid: 0,
							unpaid: 0,
						}
					);

					setStats(statusCounts);
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [refreshKey]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-4 w-full">
				<InfoCard
					title="Pendaftar"
					value={stats.total}
					icon={<Users className="text-blue-500" />}
					description="Total"
				/>
				<InfoCard
					title="Sedang Verifikasi"
					value={stats.verification}
					icon={<Clock className="text-yellow-500" />}
					description="Total"
				/>
				<InfoCard
					title="Ditolak"
					value={stats.rejected}
					icon={<XCircle className="text-red-500" />}
					description="Total"
				/>
				<InfoCard
					title="Diterima"
					value={stats.accepted}
					icon={<CheckCircle className="text-green-500" />}
					description="Total"
				/>
			</div>
			<div className="flex gap-4 w-full">
				<InfoCard
					title="Pembayaran Lunas"
					value={stats.paid}
					icon={<DollarSign className="text-green-500" />}
					description="Total"
				/>
				<InfoCard
					title="Belum Lunas"
					value={stats.unpaid}
					icon={<DollarSign className="text-red-500" />}
					description="Total"
				/>
			</div>
		</div>
	);
};

const InfoCard = ({ title, value, icon, description }) => {
	return (
		<Card className="w-full shadow rounded-md hover:shadow-lg transition-shadow">
			<CardHeader className="relative">
				<CardDescription>{title}</CardDescription>
				<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
					{value}
				</CardTitle>
				<div className="absolute right-4 top-0">{icon}</div>
				<div className="text-muted-foreground text-sm mt-1">{description}</div>
			</CardHeader>
		</Card>
	);
};

export default CardInfoPPDB;

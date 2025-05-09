"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { Loader2 } from "lucide-react";

const StatCard = ({ title, value, icon, trend }) => {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-gray-500">
					{title}
				</CardTitle>
				<div className="p-2 rounded-lg bg-gray-50">{icon}</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{trend && (
					<p className="text-xs text-green-600 mt-1">+12% dari bulan lalu</p>
				)}
			</CardContent>
		</Card>
	);
};

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
				setLoading(true);
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/daftar-ppdb`
				);
				const data = await response.json();

				if (data.message === "Data ditemukan") {
					const counts = data.data.reduce(
						(acc, curr) => {
							acc.total++;
							if (curr.status === "verification") acc.verification++;
							if (curr.status === "rejected") acc.rejected++;
							if (curr.status === "accepted") acc.accepted++;
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
					setStats(counts);
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [refreshKey]);

	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-md bg-red-50 p-4">
				<p className="text-red-600">Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-[1560px] mx-auto">
			<StatCard
				title="Total Pendaftar"
				value={stats.total}
				icon={<Users className="h-5 w-5 text-blue-500" />}
				trend="up"
			/>
			<StatCard
				title="Verifikasi"
				value={stats.verification}
				icon={<Clock className="h-5 w-5 text-yellow-500" />}
			/>
			<StatCard
				title="Diterima"
				value={stats.accepted}
				icon={<CheckCircle className="h-5 w-5 text-green-500" />}
			/>
			<StatCard
				title="Ditolak"
				value={stats.rejected}
				icon={<XCircle className="h-5 w-5 text-red-500" />}
			/>
			<StatCard
				title="Lunas"
				value={stats.paid}
				icon={<DollarSign className="h-5 w-5 text-green-500" />}
			/>
			<StatCard
				title="Belum Lunas"
				value={stats.unpaid}
				icon={<DollarSign className="h-5 w-5 text-red-500" />}
			/>
		</div>
	);
};

export default CardInfoPPDB;

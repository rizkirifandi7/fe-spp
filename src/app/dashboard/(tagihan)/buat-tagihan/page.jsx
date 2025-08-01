// app/dashboard/buat-tagihan/page.jsx
"use client";

import { useState } from "react";
import { useTagihan } from "@/hooks/useTagihan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { TagihanFormSiswa } from "./_components/tagihan-form-siswa";
import { TagihanFormKelas } from "./_components/tagihan-form-kelas";

function LoadingSkeleton() {
	return (
		<div className="container mx-auto py-12 px-4 md:px-6 space-y-6">
			<Skeleton className="h-10 w-3/4 md:w-1/2" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<Skeleton className="h-12 w-full rounded-lg" />
				<Skeleton className="h-12 w-full rounded-lg" />
			</div>
			<Skeleton className="h-12 w-1/3 md:w-1/4 rounded-lg" />
			<Skeleton className="h-72 w-full rounded-xl" />
		</div>
	);
}

export default function CreateTagihanPage() {
	const [tabValue, setTabValue] = useState("per-siswa");
	const hook = useTagihan();

	if (hook.isFetching) {
		return <LoadingSkeleton />;
	}

	return (
		<div className="min-h-screen dark:from-slate-900 dark:to-sky-950 py-8">
			<div className="container mx-auto px-4 md:px-6 space-y-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
							Buat Tagihan Baru
						</h1>
						<p className="text-slate-600 dark:text-slate-400 mt-1">
							{hook.selectedJenis
								? `Jenis Pembayaran: ${hook.selectedJenis.nama}`
								: "Pilih jenis pembayaran untuk memulai"}
						</p>
					</div>
					{hook.selectedJenis && (
						<Badge
							variant={hook.selectedJenis.isBulanan ? "default" : "secondary"}
							className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
								hook.selectedJenis.isBulanan
									? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100 border-emerald-300 dark:border-emerald-600"
									: "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 border-green-300 dark:border-green-600"
							}`}
						>
							{hook.selectedJenis.isBulanan ? "Bulanan" : "Bebas"}
						</Badge>
					)}
				</div>

				<Tabs
					value={tabValue}
					onValueChange={setTabValue}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg h-12">
						<TabsTrigger
							value="per-siswa"
							className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-slate-50 rounded-md data-[state=active]:shadow-sm transition-all"
						>
							<User className="h-5 w-5" /> Per Siswa
						</TabsTrigger>
						<TabsTrigger
							value="per-kelas"
							className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-slate-50 rounded-md data-[state=active]:shadow-sm transition-all"
						>
							<Users className="h-5 w-5" /> Per Kelas
						</TabsTrigger>
					</TabsList>

					<TabsContent value="per-siswa">
						<TagihanFormSiswa hook={hook} />
					</TabsContent>

					<TabsContent value="per-kelas">
						<TagihanFormKelas hook={hook} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

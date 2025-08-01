// app/dashboard/.../_components/CardInfoSiswa.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

// Sub-komponen untuk menampilkan item info dengan rapi
const InfoItem = ({ label, value }) => (
	<div className="space-y-1">
		<p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
			{label}
		</p>
		<p className="text-slate-800 dark:text-slate-100 text-sm">
			{value || "N/A"}
		</p>
	</div>
);

export const CardInfoSiswa = ({ selectedSiswaInfo }) => {
	if (!selectedSiswaInfo) return null;

	return (
		<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<User className="h-6 w-6 text-emerald-600" />
					Detail Informasi Siswa
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					<InfoItem label="Nama Lengkap" value={selectedSiswaInfo.nama} />
					<InfoItem label="NISN" value={selectedSiswaInfo.nisn} />
					<InfoItem
						label="Kelas & Jurusan"
						value={`${selectedSiswaInfo.nama_kelas} - ${selectedSiswaInfo.nama_jurusan}`}
					/>
					<InfoItem label="Tanggal Lahir" value={selectedSiswaInfo.tgl_lahir} />
					<InfoItem label="Email" value={selectedSiswaInfo.email} />
					<InfoItem label="Telepon" value={selectedSiswaInfo.telepon} />
				</div>
			</CardContent>
		</Card>
	);
};

export default CardInfoSiswa;

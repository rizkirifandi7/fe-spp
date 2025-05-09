import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

const CardInfoSiswa = ({ selectedSiswaInfo }) => {
	return (
		<Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 ease-in-out">
			<CardHeader className="border-b dark:border-slate-700">
				<CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
					<User className="h-6 w-6 text-green-600 dark:text-green-400" />
					Detail Informasi Siswa
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
					{[
						["Nama Lengkap", selectedSiswaInfo.nama],
						["Email", selectedSiswaInfo.email],
						["Telepon", selectedSiswaInfo.telepon],
						["Alamat", selectedSiswaInfo.alamat],
						["Kelas", selectedSiswaInfo.nama_kelas],
						["Jurusan", selectedSiswaInfo.nama_jurusan],
						["NISN", selectedSiswaInfo.nisn],
						["Jenis Kelamin", selectedSiswaInfo.jenis_kelamin],
					].map(([label, value]) => (
						<div className="space-y-1.5" key={label}>
							<p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
								{label}
							</p>
							<p className="text-slate-800 dark:text-slate-100 text-sm">
								{value}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default CardInfoSiswa;

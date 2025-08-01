// app/dashboard/pembayaran/[idTagihan]/_components/SiswaInfoCard.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InfoItem = ({ label, value }) => (
	<div>
		<p className="text-xs text-slate-600 dark:text-emerald-400 mb-1">{label}</p>
		<p className="font-medium text-slate-800 dark:text-emerald-100">{value}</p>
	</div>
);

export const SiswaInfoCard = ({ siswa, tagihan }) => {
	const getStatusVariant = (status) => {
		if (status === "paid") return "success";
		if (status === "partial") return "warning";
		return "destructive";
	};

	return (
		<Card className="bg-white dark:bg-slate-800 border dark:border-emerald-700">
			<CardHeader>
				<CardTitle>Informasi Siswa</CardTitle>
			</CardHeader>
			<CardContent className="text-sm">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<InfoItem label="Nama" value={siswa.nama} />
					<InfoItem
						label="Kelas"
						value={`${siswa.akun_siswa.kelas.nama_kelas} - ${siswa.akun_siswa.jurusan.nama_jurusan}`}
					/>
					<InfoItem label="No. Tagihan" value={tagihan.nomor_tagihan} />
					<div>
						<p className="text-xs text-slate-600 dark:text-emerald-400 mb-1">
							Status Tagihan
						</p>
						<Badge variant={getStatusVariant(tagihan.status)}>
							{tagihan.status === "paid"
								? "Lunas"
								: tagihan.status === "partial"
								? "Sebagian"
								: "Belum Lunas"}
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

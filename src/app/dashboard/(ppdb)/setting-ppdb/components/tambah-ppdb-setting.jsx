"use client";

import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useUnits } from "@/hooks/useUnits";

const kelasFormSchema = z.object({
	id_unit: z.string().min(1, "Unit harus dipilih"),
	jumlah_pembayaran: z.number().min(1, "Jumlah pembayaran harus diisi"),
	tahun_ajaran: z.string().min(1, "Tahun ajaran harus diisi"),
	target_siswa: z.number().min(1, "Target siswa harus diisi"),
	status: z.enum(["on", "off"]),
});

const TambahSettingPPDB = ({ onSuccess }) => {
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/ppdb-pembayaran`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Gagal menambahkan kelas");
			}

			return response;
		} catch (error) {
			throw error;
		}
	};

	return (
		<GenericFormDialog
			triggerVariant="add"
			triggerText="Tambah Kelas"
			dialogTitle="Tambah Kelas"
			dialogDescription="Tambahkan kelas baru ke sistem."
			formSchema={kelasFormSchema}
			defaultValues={{
				id_unit: "",
				jumlah_pembayaran: "",
				tahun_ajaran: "",
				target_siswa: "",
				status: "on",
			}}
			fields={[
				{
					name: "id_unit",
					label: "Unit",
					placeholder: loadingUnits ? "Memuat data unit..." : "Pilih unit...",
					fieldType: "select",
					options: units.map((unit) => ({
						value: unit.id,
						label: unit.nama_unit,
					})),
					disabled: loadingUnits,
					description: loadingUnits
						? "Sedang memuat data unit..."
						: "Pilih unit untuk kelas ini",
				},
				{
					name: "tahun_ajaran",
					label: "Tahun Ajaran",
					placeholder: "Masukkan tahun ajaran...",
					fieldType: "input",
					description: "Tahun ajaran untuk kelas ini misalnya 2023/2024",
				},
				{
					name: "jumlah_pembayaran",
					label: "Jumlah Pembayaran",
					currencyFormat: "IDR",
					placeholder: "Masukkan jumlah pembayaran...",
					fieldType: "number",
					description: "Jumlah pembayaran untuk daftar",
				},
				{
					name: "target_siswa",
					label: "Target Siswa",
					placeholder: "Masukkan target siswa...",
					fieldType: "number",
				},
				{
					name: "status",
					label: "Status",
					placeholder: "Pilih status...",
					fieldType: "select",
					options: [
						{ value: "on", label: "Aktif" },
						{ value: "off", label: "Nonaktif" },
					],
					description: "Status aktif/nonaktif kelas",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default TambahSettingPPDB;

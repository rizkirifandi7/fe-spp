"use client";

import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useUnits } from "@/hooks/useUnits";

const jurusanFormSchema = z.object({
	id_unit: z.string().min(1, "Unit harus dipilih"),
	nama_jurusan: z.string().min(1, "Nama jurusan harus diisi"),
	deskripsi: z.string().optional(),
	status: z.enum(["on", "off"]),
});

const TambahJurusan = ({ onSuccess }) => {
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/jurusan`,
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
				throw new Error(errorData.message || "Gagal menambahkan jurusan");
			}

			return response;
		} catch (error) {
			throw error;
		}
	};

	return (
		<GenericFormDialog
			triggerVariant="add"
			triggerText="Tambah Jurusan"
			dialogTitle="Tambah Jurusan"
			dialogDescription="Tambahkan jurusan baru ke sistem."
			formSchema={jurusanFormSchema}
			defaultValues={{
				id_unit: "",
				nama_jurusan: "",
				deskripsi: "",
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
						: "Pilih unit untuk jurusan ini",
				},
				{
					name: "nama_jurusan",
					label: "Nama Jurusan",
					placeholder: "Masukkan nama jurusan...",
					fieldType: "input",
				},
				{
					name: "deskripsi",
					label: "Deskripsi",
					placeholder: "Masukkan deskripsi jurusan...",
					fieldType: "textarea",
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
					description: "Status aktif/nonaktif jurusan",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default TambahJurusan;

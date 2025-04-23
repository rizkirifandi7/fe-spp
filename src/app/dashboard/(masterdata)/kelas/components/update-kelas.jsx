"use client";

import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useUnits } from "@/hooks/useUnits";

const kelasFormSchema = z.object({
	id_unit: z.string().min(1, "Unit harus dipilih"),
	nama_kelas: z.string().min(1, "Nama kelas harus diisi"),
	deskripsi: z.string().optional(),
	status: z.enum(["on", "off"]),
});

const UpdateKelas = ({ onSuccess, id, rowData }) => {
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/kelas/${id}`,
				{
					method: "PUT",
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
			triggerVariant="edit"
			dialogTitle="Tambah Kelas"
			dialogDescription="Tambahkan kelas baru ke sistem."
			formSchema={kelasFormSchema}
			defaultValues={{
				id_unit: rowData.id_unit?.toString() || "",
				nama_kelas: rowData.nama_kelas || "",
				deskripsi: rowData.deskripsi || "",
				status: rowData.status || "",
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
					name: "nama_kelas",
					label: "Nama Kelas",
					placeholder: "Masukkan nama kelas...",
					fieldType: "input",
				},
				{
					name: "deskripsi",
					label: "Deskripsi",
					placeholder: "Masukkan deskripsi kelas...",
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
					description: "Status aktif/nonaktif kelas",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateKelas;

"use client";

import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useUnits } from "@/hooks/useUnits";

const kasFormSchema = z.object({
	deskripsi: z.string().optional(),
	jumlah: z.number().optional(),
	tipe: z.enum(["masuk", "keluar"]),
});

const UpdateKas = ({ onSuccess, id, rowData, onDataAdded }) => {
	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/kas/${id}`,
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
				throw new Error(errorData.message || "Gagal menambahkan kas");
			}

			onDataAdded();
			return response;
		} catch (error) {
			throw error;
		}
	};

	return (
		<GenericFormDialog
			triggerVariant="edit"
			dialogTitle="Tambah Kas"
			dialogDescription="Tambahkan kas baru ke sistem."
			formSchema={kasFormSchema}
			defaultValues={{
				deskripsi: rowData.deskripsi || "",
				jumlah: rowData.jumlah || 0,
				tipe: rowData.tipe || "",
			}}
			fields={[
				{
					name: "deskripsi",
					label: "Deskripsi",
					placeholder: "Masukkan deskripsi kas...",
					fieldType: "textarea",
				},
				{
					name: "jumlah",
					label: "Jumlah",
					placeholder: "Masukkan jumlah kas...",
					fieldType: "number-idr",
				},
				{
					name: "tipe",
					label: "Tipe",
					placeholder: "Pilih tipe...",
					fieldType: "select",
					options: [
						{ value: "masuk", label: "Masuk" },
						{ value: "keluar", label: "Keluar" },
					],
					description: "Tipe aktif/nonaktif kas",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateKas;

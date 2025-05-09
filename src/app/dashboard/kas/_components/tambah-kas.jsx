"use client";

import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useUnits } from "@/hooks/useUnits";
import { de } from "date-fns/locale";

const kasFormSchema = z.object({
	deskripsi: z.string().optional(),
	jumlah: z.number().optional(),
	tipe: z.enum(["masuk", "keluar"]),
});

const TambahKas = ({ onSuccess, onDataAdded }) => {
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kas`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

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
			triggerVariant="add"
			triggerText="Tambah Kas"
			dialogTitle="Tambah Kas"
			dialogDescription="Tambahkan kas baru ke sistem."
			formSchema={kasFormSchema}
			defaultValues={{
				deskripsi: "",
				jumlah: 0,
				tipe: "masuk",
			}}
			fields={[
				{
					name: "deskripsi",
					label: "Deskripsi",
					placeholder: "Masukkan deskripsi kas...",
					fieldType: "textarea",
					description: "Deskripsi kas yang akan masuk atau keluar.",
				},
				{
					name: "jumlah",
					label: "Jumlah",
					placeholder: "Masukkan jumlah kas...",
					currencyFormat: "IDR",
					fieldType: "number",
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
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default TambahKas;

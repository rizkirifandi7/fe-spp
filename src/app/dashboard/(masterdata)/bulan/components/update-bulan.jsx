import { z } from "zod";
import { Pencil } from "lucide-react";
import GenericFormDialog from "@/components/input-form/text-input";

const bulanFormSchema = z.object({
	nama_bulan: z.string().min(1, "Nama kategori harus diisi"),
	nomor_bulan: z.number().min(1, "Nomor bulan harus diisi"),
	status: z.enum(["on", "off"]),
});

const UpdateBulan = ({ onSuccess, id, rowData }) => {
	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/bulan/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) throw new Error("Gagal update bulan");
			return response; // Return response untuk ditangani di GenericFormDialog
		} catch (error) {
			throw error; // Lempar error untuk ditangani di GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			// triggerText="Edit Bulan"
      triggerVariant="edit"
			dialogTitle="Edit Bulan"
			dialogDescription="Editkan bulan baru."
			formSchema={bulanFormSchema}
			defaultValues={{
				nama_bulan: rowData.nama_bulan || "",
				nomor_bulan: rowData.nomor_bulan || "",
				status: rowData.status,
			}}
			fields={[
				{
					name: "nama_bulan",
					label: "Nama Bulan",
					placeholder: "Masukkan nama bulan...",
					fieldType: "input",
				},
				{
					name: "nomor_bulan",
					label: "Nomor Bulan",
					placeholder: "Masukkan nomor bulan...",
					fieldType: "number",
				},
				{
					name: "status",
					label: "Status",
					placeholder: "Pilih status...",
					fieldType: "select",
					options: [
						{ value: "on", label: "ON" },
						{ value: "off", label: "OFF" },
					],
					description: "Pilih status bulan",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
			triggerIcon={<Pencil className="mr-2 h-4 w-4" />}
		/>
	);
};

export default UpdateBulan;

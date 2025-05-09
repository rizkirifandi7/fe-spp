import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";

const unitFormSchema = z.object({
	nama_unit: z.string().min(1, "Nama kategori harus diisi"),
	deskripsi: z.string().optional(),
});

const UpdateUnit = ({ onSuccess, id, rowData }) => {
	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/unit/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) throw new Error("Gagal menambahkan unit");
			return response; // Return response untuk ditangani di GenericFormDialog
		} catch (error) {
			throw error; // Lempar error untuk ditangani di GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			triggerVariant="edit"
			dialogTitle="Tambah Unit"
			dialogDescription="Tambahkan unit baru."
			formSchema={unitFormSchema}
			defaultValues={{
				nama_unit: rowData.nama_unit || "",
				deskripsi: rowData.deskripsi || "",
			}}
			fields={[
				{
					name: "nama_unit",
					label: "Nama Unit",
					placeholder: "Masukkan nama unit...",
					fieldType: "input",
				},
				{
					name: "deskripsi",
					label: "Deskripsi",
					placeholder: "Masukkan deskripsi...",
					fieldType: "input",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateUnit;

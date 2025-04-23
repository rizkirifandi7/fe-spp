import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";

const roleFormSchema = z.object({
	role: z.string().min(1, "Nama kategori harus diisi"),
});

const UpdateRole = ({ onSuccess, id, rowData }) => {
	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/role/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) throw new Error("Gagal menambahkan role");
			return response; // Return response untuk ditangani di GenericFormDialog
		} catch (error) {
			throw error; // Lempar error untuk ditangani di GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			triggerVariant="edit"
			dialogTitle="Tambah Role"
			dialogDescription="Tambahkan role baru."
			formSchema={roleFormSchema}
			defaultValues={{
				role: rowData.role || "",
			}}
			fields={[
				{
					name: "role",
					label: "Nama Role",
					placeholder: "Masukkan nama role...",
					fieldType: "input",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateRole;

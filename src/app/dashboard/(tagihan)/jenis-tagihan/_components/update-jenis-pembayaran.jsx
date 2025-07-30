import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";

const jenisPembayaranFormSchema = z.object({
	nama: z.string().min(1, "Nama tipe harus diisi"),
	deskripsi: z.string().optional(),
});

const UpdateTipePembayaran = ({ onSuccess, id, rowData }) => {
	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/jenis-pembayaran/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) throw new Error("Gagal menambahkan tipe_pembayaran");
			return response; // Return response untuk ditangani di GenericFormDialog
		} catch (error) {
			throw error; // Lempar error untuk ditangani di GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			triggerVariant="edit"
			dialogTitle="Update Jenis Pembayaran"
			dialogDescription="Update jenis Pembayaran."
			formSchema={jenisPembayaranFormSchema}
			defaultValues={{
				nama: rowData.nama || "",
				deskripsi: rowData.deskripsi || "",
			}}
			fields={[
				{
					name: "nama",
					label: "Jenis Pembayaran",
					placeholder: "Pilih Jenis Pembayaran...",
					fieldType: "select",
					options: [
						{ value: "Bebas", label: "Bebas" },
						{ value: "Bulanan", label: "Bulanan" },
					],
				},
				{
					name: "deskripsi",
					label: "Deskripsi",
					placeholder: "Masukkan deskripsi tipe pembayaran...",
					fieldType: "textarea",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateTipePembayaran;

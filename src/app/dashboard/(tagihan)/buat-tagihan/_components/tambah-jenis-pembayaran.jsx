import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";

const tipeFormSchema = z.object({
	nama: z.string().min(1, "Nama tipe harus diisi"),
	deskripsi: z.string().optional(),
});

const TambahTipePembayaran = ({ onSuccess }) => {
	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/jenis-pembayaran`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) throw new Error("Gagal menambahkan jenis Pembayaran");
			return response; // Return response untuk ditangani di GenericFormDialog
		} catch (error) {
			throw error; // Lempar error untuk ditangani di GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			triggerVariant="add"
			triggerText="Tambah Jenis Pembayaran"
			dialogTitle="Tambah Jenis Pembayaran"
			dialogDescription="Tambahkan jenis Pembayaran baru."
			formSchema={tipeFormSchema}
			defaultValues={{
				nama: "",
				deskripsi: "",
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

export default TambahTipePembayaran;

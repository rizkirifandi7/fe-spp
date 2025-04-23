import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";

const bulanFormSchema = z.object({
	nama_bulan: z.string().min(1, "Nama kategori harus diisi"),
	nomor_bulan: z.number().min(1, "Nomor bulan harus diisi"),
	status: z.enum(["on", "off"]),
});

const TambahBulan = ({ onSuccess }) => {
	const handleSubmit = async (values) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bulan`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) throw new Error("Gagal menambahkan bulan");
			return response; // Return response untuk ditangani di GenericFormDialog
		} catch (error) {
			throw error; // Lempar error untuk ditangani di GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			triggerText="Tambah Bulan"
			triggerVariant="add"
			dialogTitle="Tambah Bulan"
			dialogDescription="Tambahkan bulan baru."
			formSchema={bulanFormSchema}
			defaultValues={{
				nama_bulan: "",
				nomor_bulan: "",
				status: "on",
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
		/>
	);
};

export default TambahBulan;

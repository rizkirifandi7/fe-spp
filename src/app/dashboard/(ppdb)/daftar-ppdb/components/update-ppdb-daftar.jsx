"use client";

import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useUnits } from "@/hooks/useUnits";

const kelasFormSchema = z.object({
	id_ppdb: z.string().min(1, "Unit harus dipilih"),
	nik: z.string().min(1, "NIK harus diisi"),
	nama: z.string().min(1, "Nama harus diisi"),
	email: z.string().email("Email tidak valid"),
	telepon: z
		.string()
		.min(10, "Nomor telepon minimal 10 digit")
		.max(15, "Nomor telepon maksimal 15 digit")
		.regex(/^\+?\d+$/, "Format nomor telepon tidak valid"),
	tgl_lahir: z.any(),
	alamat: z.string().min(1, "Alamat harus diisi"),
	status: z.enum([
		"registered",
		"pending",
		"rejected",
		"accepted",
		"verification",
	]),
});

const UpdatePPDB = ({ onSuccess, id, rowData, onDataAdded }) => {
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/daftar-ppdb/${id}`,
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
				throw new Error(errorData.message || "Gagal update data");
			}

			return response;
		} catch (error) {
			throw error;
		}
	};

	return (
		<GenericFormDialog
			layoutType="grid"
			dialogClassName="max-h-[80dvh] overflow-y-auto sm:max-w-[800px]"
			formClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
			triggerVariant="edit"
			dialogTitle="Tambah PPDB"
			dialogDescription="Tambahkan PPDB baru ke sistem."
			formSchema={kelasFormSchema}
			defaultValues={{
				id_ppdb: rowData?.id_ppdb?.toString() || "",
				nik: rowData?.nik || "",
				nama: rowData?.nama || "",
				email: rowData?.email || "",
				telepon: rowData?.telepon || "",
				tgl_lahir: rowData?.tgl_lahir || "",
				alamat: rowData?.alamat || "",
				status: rowData?.status || "",
			}}
			fields={[
				{
					name: "id_ppdb",
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
					name: "nik",
					label: "NIK",
					placeholder: "Masukkan NIK",
					fieldType: "input",
					description: "Masukkan NIK siswa",
				},
				{
					name: "nama",
					label: "Nama",
					placeholder: "Masukkan nama",
					fieldType: "input",
					description: "Masukkan nama siswa",
				},
				{
					name: "email",
					label: "Email",
					placeholder: "Masukkan email",
					fieldType: "input",
					description: "Masukkan email siswa",
				},
				{
					name: "telepon",
					label: "Nomor Telepon",
					fieldType: "tel",
					placeholder: "+62 812 3456 7890",
					description: "Masukkan nomor telepon dengan kode negara (+62)",
				},
				{
					name: "tgl_lahir",
					label: "Tanggal Lahir",
					fieldType: "date",
					placeholder: "Pilih tanggal lahir...",
					description: "Masukkan tanggal lahir siswa",
				},
				{
					name: "alamat",
					label: "Alamat",
					placeholder: "Masukkan alamat",
					fieldType: "textarea",
					description: "Masukkan alamat siswa",
				},
				{
					name: "status",
					label: "Status",
					placeholder: "Pilih status",
					fieldType: "select",
					options: [
						{ value: "registered", label: "Terdaftar" },
						{ value: "rejected", label: "Ditolak" },
						{ value: "accepted", label: "Diterima" },
						{ value: "verification", label: "Verifikasi" },
					],
					description: "Pilih status siswa",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
			onDataAdded={onDataAdded}
		/>
	);
};

export default UpdatePPDB;

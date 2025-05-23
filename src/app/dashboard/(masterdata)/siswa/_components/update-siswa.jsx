import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useKelas } from "@/hooks/useKelas";
import { useJurusan } from "@/hooks/useJurusan";
import { useUnits } from "@/hooks/useUnits";

const roleFormSchema = z.object({
	id_kelas: z.string().min(1, "Kelas harus dipilih"),
	id_jurusan: z.string().min(1, "Jurusan harus dipilih"),
	id_unit: z.string().min(1, "Unit harus dipilih"),
	role: z.string().min(1, "Role harus dipilih"),
	nisn: z.string().min(1, "NISN harus diisi"),
	nama: z.string().min(1, "Nama harus diisi"),
	email: z.string().email("Email tidak valid"),
	password: z.string().optional(), // Keep optional
	telepon: z
		.string()
		.min(10, "Nomor telepon minimal 10 digit")
		.max(15, "Nomor telepon maksimal 15 digit")
		.regex(/^\+?\d+$/, "Format nomor telepon tidak valid"),
	tgl_lahir: z
		.date()
		.refine(
			(date) => date instanceof Date && !isNaN(date.getTime()),
			"Tanggal lahir tidak valid"
		),
	alamat: z.string().min(1, "Alamat harus diisi"),
	status: z.enum(["on", "off"]),
	gambar: z.any(), // Updated for FileList, optional
	nik: z.string().optional(),
	tempat_lahir: z.string().optional(),
	jenis_kelamin: z.string().optional(),
	kebutuhan_khusus: z.string().optional(),
	disabilitas: z.string().optional(),
	no_kip: z.string().optional(),
	nama_ayah: z.string().optional(),
	nama_ibu: z.string().optional(),
	nama_wali: z.string().optional(),
});

const UpdateSiswa = ({ onSuccess, id, rowData }) => {
	const { kelas, loading: loadingKelass, error: kelassError } = useKelas();
	const {
		jurusan,
		loading: loadingJurusans,
		error: jurusansError,
	} = useJurusan();
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const handleSubmit = async (values) => {
		try {
			const formData = new FormData();

			// Append all fields to FormData
			Object.keys(values).forEach((key) => {
				if (key === "gambar") {
					// Handle file separately
					return;
				}
				if (
					key === "password" &&
					(!values.password || values.password.trim() === "")
				) {
					// Don't append password if it's empty or just whitespace
					return;
				}
				if (values[key] instanceof Date) {
					formData.append(key, values[key].toISOString()); // Send date as ISO string
				} else if (values[key] !== undefined && values[key] !== null) {
					formData.append(key, values[key]);
				}
			});

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa/${id}`,
				{
					method: "PUT",
					// DO NOT set Content-Type header, the browser will do it for FormData
					body: formData,
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Gagal memperbarui data siswa");
			}
			return response; // Return response for GenericFormDialog
		} catch (error) {
			throw error; // Re-throw error for GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			layoutType="grid"
			dialogClassName="max-h-[80dvh] overflow-y-auto sm:max-w-[800px]"
			formClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
			triggerVariant="edit"
			dialogTitle="Update Data Siswa"
			dialogDescription="Perbarui data siswa."
			formSchema={roleFormSchema}
			defaultValues={{
				nisn: rowData.akun_siswa?.nisn || "",
				id_kelas: rowData.akun_siswa?.kelas?.id?.toString() || "",
				id_jurusan: rowData.akun_siswa?.jurusan?.id?.toString() || "",
				id_unit: rowData.akun_siswa?.unit?.id?.toString() || "",
				role: rowData.role?.toString() || "siswa",
				nama: rowData.nama || "",
				email: rowData.email || "",
				password: "", // Default to empty, user can fill to change
				telepon: rowData.telepon || "",
				tgl_lahir: rowData.akun_siswa?.tgl_lahir
					? new Date(rowData.akun_siswa.tgl_lahir)
					: undefined,
				alamat: rowData.alamat || "",
				status: rowData.status || "on",
				nik: rowData.akun_siswa?.nik || "",
				tempat_lahir: rowData.akun_siswa?.tempat_lahir || "",
				jenis_kelamin: rowData.akun_siswa?.jenis_kelamin || "",
				kebutuhan_khusus: rowData.akun_siswa?.kebutuhan_khusus || "",
				disabilitas: rowData.akun_siswa?.disabilitas || "",
				no_kip: rowData.akun_siswa?.no_kip || "",
				nama_ayah: rowData.akun_siswa?.nama_ayah || "",
				nama_ibu: rowData.akun_siswa?.nama_ibu || "",
				nama_wali: rowData.akun_siswa?.nama_wali || "",
				gambar: undefined, // Default for file input
				hapus_gambar: false, // Default for checkbox
			}}
			fields={[
				{
					name: "nisn",
					label: "NISN",
					placeholder: "Masukkan NISN...",
					fieldType: "input",
				},
				{
					name: "nama",
					label: "Nama Lengkap",
					placeholder: "Masukkan nama...",
					fieldType: "input",
				},
				{
					name: "email",
					label: "Email",
					placeholder: "Masukkan email...",
					fieldType: "input",
				},
				{
					name: "password",
					label: "Password (Opsional)",
					placeholder: "Kosongkan jika tidak ingin diubah",
					fieldType: "input",
					type: "password",
				},
				{
					name: "telepon",
					label: "Telepon",
					placeholder: "Masukkan telepon...",
					fieldType: "tel",
				},
				{ name: "tgl_lahir", label: "Tanggal Lahir", fieldType: "date" },
				{
					name: "alamat",
					label: "Alamat",
					placeholder: "Masukkan alamat...",
					fieldType: "textarea",
				},
				{
					name: "tempat_lahir",
					label: "Tempat Lahir",
					placeholder: "Masukkan tempat lahir...",
					fieldType: "input",
				},
				{
					name: "nik",
					label: "NIK",
					placeholder: "Masukkan NIK...",
					fieldType: "input",
				},
				{
					name: "jenis_kelamin",
					label: "Jenis Kelamin",
					fieldType: "select",
					options: [
						{ value: "Laki-Laki", label: "Laki-Laki" },
						{ value: "Perempuan", label: "Perempuan" },
					],
				},
				{
					name: "role",
					label: "Role",
					fieldType: "select",
					options: [{ value: "siswa", label: "Siswa" } /* other roles */],
				},
				{
					name: "id_unit",
					label: "Unit",
					placeholder: loadingUnits ? "Memuat..." : "Pilih unit...",
					fieldType: "select",
					options: units.map((unit) => ({
						value: unit.id.toString(),
						label: unit.nama_unit,
					})),
					disabled: loadingUnits,
				},
				{
					name: "id_kelas",
					label: "Kelas",
					placeholder: loadingKelass ? "Memuat..." : "Pilih kelas...",
					fieldType: "select",
					options: kelas.map((k) => ({
						value: k.id.toString(),
						label: k.nama_kelas,
					})),
					disabled: loadingKelass,
				},
				{
					name: "id_jurusan",
					label: "Jurusan",
					placeholder: loadingJurusans ? "Memuat..." : "Pilih jurusan...",
					fieldType: "select",
					options: jurusan.map((j) => ({
						value: j.id.toString(),
						label: j.nama_jurusan,
					})),
					disabled: loadingJurusans,
				},
				{
					name: "status",
					label: "Status Akun",
					fieldType: "select",
					options: [
						{ value: "on", label: "Aktif" },
						{ value: "off", label: "Non-Aktif" },
					],
				},
				{
					name: "kebutuhan_khusus",
					label: "Kebutuhan Khusus",
					placeholder: "Mis: Tidak Ada",
					fieldType: "input",
				},
				{
					name: "disabilitas",
					label: "Disabilitas",
					placeholder: "Mis: Tidak Ada",
					fieldType: "input",
				},
				{
					name: "no_kip",
					label: "No. KIP (Jika Ada)",
					placeholder: "Masukkan No. KIP...",
					fieldType: "input",
				},
				{
					name: "nama_ayah",
					label: "Nama Ayah",
					placeholder: "Masukkan nama ayah...",
					fieldType: "input",
				},
				{
					name: "nama_ibu",
					label: "Nama Ibu",
					placeholder: "Masukkan nama ibu...",
					fieldType: "input",
				},
				{
					name: "nama_wali",
					label: "Nama Wali (Jika Ada)",
					placeholder: "Masukkan nama wali...",
					fieldType: "input",
				},
				{
					name: "gambar",
					label: "Ganti Gambar Profil",
					fieldType: "file",
					description: "Unggah gambar baru jika ingin mengganti.",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateSiswa;
// ...existing code...

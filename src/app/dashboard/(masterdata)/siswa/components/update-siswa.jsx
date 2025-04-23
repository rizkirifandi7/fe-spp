import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useRoles } from "@/hooks/useRole";
import { useKelas } from "@/hooks/useKelas";
import { useJurusan } from "@/hooks/useJurusan";
import { useUnits } from "@/hooks/useUnits";

const roleFormSchema = z.object({
	id_kelas: z.string().min(1, "Kelas harus dipilih"),
	id_jurusan: z.string().min(1, "Jurusan harus dipilih"),
	id_unit: z.string().min(1, "Unit harus dipilih"),
	id_role: z.string().min(1, "Role harus dipilih"),
	nisn: z.string().min(1, "NISN harus diisi"),
	nama: z.string().min(1, "Nama harus diisi"),
	email: z.string().email("Email tidak valid"),
	password: z.string().optional(),
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
	gambar: z.string().optional(),
});

const UpdateSiswa = ({ onSuccess, id, rowData }) => {
	const { roles, loading: loadingRoles, error: rolesError } = useRoles();
	const { kelas, loading: loadingKelass, error: kelassError } = useKelas();
	const {
		jurusan,
		loading: loadingJurusans,
		error: jurusansError,
	} = useJurusan();
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/akun/siswa/${id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(values),
				}
			);

			if (!response.ok) throw new Error("Gagal menambahkan akun");
			return response; // Return response untuk ditangani di GenericFormDialog
		} catch (error) {
			throw error; // Lempar error untuk ditangani di GenericFormDialog
		}
	};

	return (
		<GenericFormDialog
			layoutType="grid"
			dialogClassName="max-h-[80dvh] overflow-y-auto sm:max-w-[800px]"
			formClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
			triggerVariant="edit"
			dialogTitle="Tambah Siswa"
			dialogDescription="Tambahkan siswa baru."
			formSchema={roleFormSchema}
			defaultValues={{
				nisn: rowData.akun_siswa?.nisn || "",
				id_kelas: rowData.akun_siswa?.kelas?.id.toString() || "",
				id_jurusan: rowData.akun_siswa?.jurusan?.id.toString()  || "",
				id_unit: rowData.akun_siswa?.unit?.id.toString() || "",
				id_role: rowData.id_role?.toString() || "",
				nama: rowData.nama || "",
				email: rowData.email || "",
				password: "",
				telepon: rowData.telepon || "",
				tgl_lahir: rowData.tgl_lahir ? new Date(rowData.tgl_lahir) : "",
				alamat: rowData.alamat || "",
				status: rowData.status || "on",
				gambar: "",
			}}
			fields={[
				{
					name: "nisn",
					label: "Nisn",
					placeholder: "Masukkan nisn...",
					fieldType: "input",
				},
				{
					name: "nama",
					label: "Nama",
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
					label: "Password",
					placeholder: "Masukkan password...",
					fieldType: "input",
				},
				{
					name: "telepon",
					label: "Telepon",
					placeholder: "Masukkan telepon...",
					fieldType: "tel",
				},
				{
					name: "tgl_lahir",
					label: "Tanggal lahir",
					placeholder: "Masukkan tgl_lahir...",
					fieldType: "date",
				},
				{
					name: "alamat",
					label: "Alamat",
					placeholder: "Masukkan alamat...",
					fieldType: "textarea",
				},
				{
					name: "id_role",
					label: "Role",
					placeholder: loadingRoles ? "Memuat data role..." : "Pilih role...",
					fieldType: "select",
					options: roles.map((role) => ({
						value: role.id,
						label: role.role,
					})),
					disabled: loadingRoles,
					description: loadingRoles
						? "Sedang memuat data role..."
						: "Pilih role untuk akun ini",
				},
				{
					name: "id_unit",
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
					name: "id_kelas",
					label: "Kelas",
					placeholder: loadingKelass
						? "Memuat data kelas..."
						: "Pilih kelas...",
					fieldType: "select",
					options: kelas.map((kelas) => ({
						value: kelas.id,
						label: kelas.nama_kelas,
					})),
					disabled: loadingKelass,
					description: loadingKelass
						? "Sedang memuat data kelas..."
						: "Pilih kelas untuk akun ini",
				},
				{
					name: "id_jurusan",
					label: "Jurusan",
					placeholder: loadingJurusans
						? "Memuat data jurusan..."
						: "Pilih jurusan...",
					fieldType: "select",
					options: jurusan.map((jurusan) => ({
						value: jurusan.id,
						label: jurusan.nama_jurusan,
					})),
					disabled: loadingJurusans,
					description: loadingJurusans
						? "Sedang memuat data jurusan..."
						: "Pilih jurusan untuk akun ini",
				},
				{
					name: "status",
					label: "Status",
					placeholder: "Pilih status...",
					fieldType: "select",
					options: [
						{ value: "on", label: "Aktif" },
						{ value: "off", label: "Non-Aktif" },
					],
					description: "Pilih status akun",
				},
				{
					name: "gambar",
					label: "Gambar",
					placeholder: "Masukkan gambar...",
					fieldType: "file",
					description: "Unggah gambar profil siswa",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateSiswa;

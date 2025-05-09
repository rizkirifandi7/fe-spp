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
	kebutuhan_khusus: z.enum(["Ada", "Tidak Ada"]),
	disabilitas: z.enum(["Ada", "Tidak Ada"]),
	nama_ayah: z.string().optional(),
	nama_ibu: z.string().optional(),
	nama_wali: z.string().optional(),
	no_kip: z.string().optional(),
	tempat_lahir: z.string().optional(),
	jenis_kelamin: z.enum(["Laki-Laki", "Perempuan"]),
	tempat_lahir: z.string().optional(),
	nik: z.string().optional(),
});

const TambahSiswa = ({ onSuccess }) => {
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
				`${process.env.NEXT_PUBLIC_API_URL}/auth/register-siswa`,
				{
					method: "POST",
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
			triggerVariant="add"
			triggerText="Tambah Siswa"
			dialogTitle="Tambah Siswa"
			dialogDescription="Tambahkan siswa baru."
			formSchema={roleFormSchema}
			defaultValues={{
				nisn: "",
				id_kelas: "",
				id_jurusan: "",
				id_unit: "",
				role: "",
				nama: "",
				email: "",
				password: "",
				telepon: "",
				tgl_lahir: "",
				alamat: "",
				status: "on",
				gambar: "",
				kebutuhan_khusus: "",
				disabilitas: "",
				nama_ayah: "",
				nama_ibu: "",
				nama_wali: "",
				no_kip: "",
				tempat_lahir: "",
				jenis_kelamin: "",
				nik: "",
			}}
			fields={[
				{
					name: "nisn",
					label: "NISN",
					placeholder: "Masukkan nisn...",
					fieldType: "input",
				},
				{
					name: "nik",
					label: "NIK",
					placeholder: "Masukkan nik...",
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
					name: "tempat_lahir",
					label: "Tempat Lahir",
					placeholder: "Masukkan tempat lahir...",
					fieldType: "input",
				},
				{
					name: "jenis_kelamin",
					label: "Jenis Kelamin",
					placeholder: "Pilih jenis kelamin...",
					fieldType: "select",
					options: [
						{ value: "Laki-Laki", label: "Laki-laki" },
						{ value: "Perempuan", label: "Perempuan" },
					],
				},
				{
					name: "alamat",
					label: "Alamat",
					placeholder: "Masukkan alamat...",
					fieldType: "textarea",
				},
				{
					name: "no_kip",
					label: "No KIP",
					placeholder: "Masukkan no kip...",
					fieldType: "input",
				},
				{
					name: "role",
					label: "Role",
					placeholder: "Pilih role...",
					fieldType: "select",
					options: [
						{ value: "admin", label: "Admin" },
						{ value: "siswa", label: "Siswa" },
						{ value: "guru", label: "guru" },
					],
					description: "Pilih role akun",
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
					name: "kebutuhan_khusus",
					label: "Kebutuhan Khusus",
					placeholder: "Pilih kebutuhan khusus...",
					fieldType: "select",
					options: [
						{ value: "Ada", label: "Ada" },
						{ value: "Tidak Ada", label: "Tidak Ada" },
					],
					description: "Pilih kebutuhan_khusus akun",
				},
				{
					name: "disabilitas",
					label: "Disabilitas",
					placeholder: "Pilih disabilitas...",
					fieldType: "select",
					options: [
						{ value: "Ada", label: "Ada" },
						{ value: "Tidak Ada", label: "Tidak Ada" },
					],
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
					label: "Nama Wali",
					placeholder: "Masukkan nama wali...",
					fieldType: "input",
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

export default TambahSiswa;

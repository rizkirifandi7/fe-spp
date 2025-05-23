"use client";

import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input"; // Pastikan path ini benar
import { useKelas } from "@/hooks/useKelas";
import { useJurusan } from "@/hooks/useJurusan";
import { useUnits } from "@/hooks/useUnits";
import {
	User,
	Briefcase,
	GraduationCap,
	Hash,
	Mail,
	KeyRound,
	Phone,
	Calendar,
	MapPin,
	Users2,
	Home,
	ShieldCheck,
	Paperclip,
	Image as ImageIcon,
	Info,
	UserSquare,
	UserCog,
} from "lucide-react";

// Skema validasi Zod (tidak ada perubahan signifikan di sini, hanya memastikan konsistensi)
const roleFormSchema = z.object({
	id_kelas: z.string().min(1, "Kelas harus dipilih"),
	id_jurusan: z.string().min(1, "Jurusan harus dipilih"),
	id_unit: z.string().min(1, "Unit harus dipilih"),
	role: z.string().min(1, "Role harus dipilih"),
	nisn: z.string().min(1, "NISN harus diisi"),
	nama: z.string().min(1, "Nama lengkap harus diisi"),
	email: z.string().email("Format email tidak valid"),
	password: z.string().min(6, "Password minimal 6 karakter"),
	telepon: z
		.string()
		.min(10, "Nomor telepon minimal 10 digit")
		.max(15, "Nomor telepon maksimal 15 digit")
		.regex(
			/^\+?\d+$/,
			"Format nomor telepon tidak valid (hanya angka, boleh diawali '+')"
		),
	tgl_lahir: z
		.date({
			invalid_type_error: "Tanggal lahir harus berupa tanggal yang valid.",
		})
		.refine(
			(date) => date < new Date(),
			"Tanggal lahir tidak boleh di masa depan."
		),
	alamat: z.string().min(1, "Alamat harus diisi"),
	status: z.enum(["on", "off"]),
	gambar: z.any().optional(), // Dibuat opsional
	kebutuhan_khusus: z.string().min(1, "Kebutuhan khusus harus diisi"),
	disabilitas: z.string().min(1, "Disabilitas harus diisi"),
	nama_ayah: z.string().min(1, "Nama ayah harus diisi"),
	nama_ibu: z.string().min(1, "Nama ibu harus diisi"),
	nama_wali: z.string().optional(),
	no_kip: z.string().optional(),
	tempat_lahir: z.string().min(1, "Tempat lahir harus diisi"),
	jenis_kelamin: z.enum(["Laki-Laki", "Perempuan"], {
		errorMap: () => ({ message: "Jenis kelamin harus dipilih." }),
	}),
	nik: z.string().min(1, "NIK harus diisi"),
});

const TambahSiswa = ({ onSuccess }) => {
	const { kelas, loading: loadingKelass } = useKelas(); // Error state bisa ditambahkan jika ada
	const { jurusan, loading: loadingJurusans } = useJurusan();
	const { units, loading: loadingUnits } = useUnits();

	const handleSubmit = async (values) => {
		try {
			// Error handling sudah ada di GenericFormDialog
			const formData = new FormData();
			Object.keys(values).forEach((key) => {
				if (
					key === "gambar" &&
					values.gambar &&
					values.gambar[0] instanceof File
				) {
					formData.append("gambar", values.gambar[0]);
				} else if (values[key] instanceof Date) {
					formData.append(key, values[key].toISOString().split("T")[0]);
				} else if (
					values[key] !== undefined &&
					values[key] !== null &&
					key !== "gambar"
				) {
					formData.append(key, values[key]);
				}
			});

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/register-siswa`,
				{
					method: "POST",
					body: formData,
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message ||
						"Gagal menambahkan siswa. Periksa kembali data Anda."
				);
			}
			return response;
		} catch (error) {
			throw error;
		}
	};

	// Definisi fields dengan ikon dan pengelompokan
	const formFields = [
		// Section: Informasi Pribadi Siswa
		{
			fieldType: "separator",
			label: "Informasi Pribadi Siswa",
			className: "md:col-span-2 mt-4",
		},
		{
			name: "nama",
			label: "Nama Lengkap",
			placeholder: "Masukkan nama lengkap",
			fieldType: "input",
			icon: User,
		},
		{
			name: "nisn",
			label: "NISN",
			placeholder: "Masukkan NISN",
			fieldType: "input",
			icon: Hash,
		},
		{
			name: "nik",
			label: "NIK",
			placeholder: "Masukkan NIK",
			fieldType: "input",
			icon: Info,
		},
		{
			name: "email",
			label: "Email",
			placeholder: "contoh@email.com",
			fieldType: "input",
			type: "email",
			icon: Mail,
		},
		{
			name: "password",
			label: "Password Akun",
			placeholder: "Minimal 6 karakter",
			fieldType: "input",
			type: "password",
			icon: KeyRound,
		},
		{
			name: "telepon",
			label: "Nomor Telepon",
			placeholder: "+628xxxxxxxxxx",
			fieldType: "tel",
			icon: Phone,
		},
		{
			name: "tempat_lahir",
			label: "Tempat Lahir",
			placeholder: "Kota kelahiran",
			fieldType: "input",
			icon: MapPin,
		},
		{
			name: "tgl_lahir",
			label: "Tanggal Lahir",
			fieldType: "date",
			icon: Calendar,
		},
		{
			name: "jenis_kelamin",
			label: "Jenis Kelamin",
			fieldType: "select",
			options: [
				{ value: "Laki-Laki", label: "Laki-Laki" },
				{ value: "Perempuan", label: "Perempuan" },
			],
			icon: Users2,
		},
		{
			name: "alamat",
			label: "Alamat Lengkap",
			placeholder: "Masukkan alamat lengkap siswa",
			fieldType: "textarea",
			className: "md:col-span-2",
			icon: Home,
		},

		// Section: Informasi Akademik
		{
			fieldType: "separator",
			label: "Informasi Akademik",
			className: "md:col-span-2 mt-6",
		},
		{
			name: "id_unit",
			label: "Unit Sekolah",
			placeholder: loadingUnits ? "Memuat unit..." : "Pilih unit",
			fieldType: "select",
			options: units.map((unit) => ({
				value: unit.id.toString(),
				label: unit.nama_unit,
			})),
			disabled: loadingUnits,
			icon: GraduationCap,
		},
		{
			name: "id_kelas",
			label: "Kelas",
			placeholder: loadingKelass ? "Memuat kelas..." : "Pilih kelas",
			fieldType: "select",
			options: kelas.map((k) => ({
				value: k.id.toString(),
				label: k.nama_kelas,
			})),
			disabled: loadingKelass,
			icon: GraduationCap,
		},
		{
			name: "id_jurusan",
			label: "Jurusan",
			placeholder: loadingJurusans ? "Memuat jurusan..." : "Pilih jurusan",
			fieldType: "select",
			options: jurusan.map((j) => ({
				value: j.id.toString(),
				label: j.nama_jurusan,
			})),
			disabled: loadingJurusans,
			icon: Briefcase,
		},
		{
			name: "role",
			label: "Role Akun",
			fieldType: "select",
			options: [{ value: "siswa", label: "Siswa" }],
			description: "Role untuk akun ini (otomatis Siswa).",
			disabled: true,
			icon: UserCog,
		},
		{
			name: "status",
			label: "Status Akun",
			fieldType: "select",
			options: [
				{ value: "on", label: "Aktif" },
				{ value: "off", label: "Non-Aktif" },
			],
			icon: ShieldCheck,
		},

		// Section: Informasi Tambahan
		{
			fieldType: "separator",
			label: "Informasi Tambahan",
			className: "md:col-span-2 mt-6",
		},
		{
			name: "no_kip",
			label: "No. KIP (Opsional)",
			placeholder: "Masukkan No. KIP jika ada",
			fieldType: "input",
			icon: Paperclip,
		},
		{
			name: "kebutuhan_khusus",
			label: "Kebutuhan Khusus",
			fieldType: "select",
			options: [
				{ value: "Tidak Ada", label: "Tidak Ada" },
				{ value: "Ada", label: "Ada (Jelaskan)" },
			],
			icon: Info,
		}, // Pertimbangkan textarea jika 'Ada'
		{
			name: "disabilitas",
			label: "Disabilitas",
			fieldType: "select",
			options: [
				{ value: "Tidak Ada", label: "Tidak Ada" },
				{ value: "Ada", label: "Ada (Jelaskan)" },
			],
			icon: Info,
		}, // Pertimbangkan textarea jika 'Ada'

		// Section: Data Orang Tua / Wali
		{
			fieldType: "separator",
			label: "Data Orang Tua / Wali",
			className: "md:col-span-2 mt-6",
		},
		{
			name: "nama_ayah",
			label: "Nama Ayah",
			placeholder: "Nama lengkap ayah",
			fieldType: "input",
			icon: UserSquare,
		},
		{
			name: "nama_ibu",
			label: "Nama Ibu",
			placeholder: "Nama lengkap ibu",
			fieldType: "input",
			icon: UserSquare,
		},
		{
			name: "nama_wali",
			label: "Nama Wali (Opsional)",
			placeholder: "Nama lengkap wali jika ada",
			fieldType: "input",
			icon: UserSquare,
		},

		// Section: Unggah Foto
		{
			fieldType: "separator",
			label: "Foto Profil",
			className: "md:col-span-2 mt-6",
		},
		{
			name: "gambar",
			label: "Gambar Profil (Opsional)",
			fieldType: "file",
			description: "Format: JPG, PNG. Maks: 2MB.",
			icon: ImageIcon,
			className: "md:col-span-2",
		},
	];

	return (
		<GenericFormDialog
			layoutType="grid" // Tetap grid untuk banyak field
			dialogClassName="max-h-[90dvh] sm:max-w-3xl md:max-w-4xl" // Dibuat lebih lebar untuk 2 kolom
			formClassName="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-1" // Padding form diatur di sini
			triggerVariant="add" // Ini akan menghasilkan tombol hijau emerald
			triggerText="Tambah Data Siswa Baru"
			dialogTitle="Registrasi Siswa Baru"
			dialogDescription="Lengkapi formulir di bawah ini untuk menambahkan siswa baru ke sistem."
			formSchema={roleFormSchema}
			defaultValues={{
				nisn: "",
				id_kelas: "",
				id_jurusan: "",
				id_unit: "",
				role: "siswa",
				nama: "",
				email: "",
				password: "",
				telepon: "",
				tgl_lahir: undefined,
				alamat: "",
				status: "on",
				gambar: undefined,
				kebutuhan_khusus: "Tidak Ada",
				disabilitas: "Tidak Ada",
				nama_ayah: "",
				nama_ibu: "",
				nama_wali: "",
				no_kip: "",
				tempat_lahir: "",
				jenis_kelamin: undefined,
				nik: "",
			}}
			fields={formFields}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
			submitButtonText="Simpan Data Siswa" // Teks tombol submit kustom
		/>
	);
};

export default TambahSiswa;

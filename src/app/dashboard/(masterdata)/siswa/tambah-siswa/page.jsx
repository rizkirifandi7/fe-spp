"use client";

import React, { useState, useEffect } from "react"; // useCallback dihapus karena handleSubmit tidak lagi di-pass sebagai prop yang sering berubah
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Asumsi komponen DatePicker dan PhoneInput sudah ada dan diimpor dengan benar
import { DatePicker } from "@/components/input-form/date-input"; // Sesuaikan path jika perlu
import { PhoneInput } from "@/components/input-form/phone-input"; // Sesuaikan path jika perlu
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useKelas } from "@/hooks/useKelas";
import { useJurusan } from "@/hooks/useJurusan";
import { useUnits } from "@/hooks/useUnits";
import { toast } from "sonner"; // Menggunakan sonner untuk notifikasi
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
	Loader2,
	CheckCircle2,
	ArrowLeft,
	AlertCircle,
} from "lucide-react";
import Link from "next/link"; // Untuk tombol kembali
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Skema validasi Zod (sama seperti sebelumnya)
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
	gambar: z.any(),
	kebutuhan_khusus: z.string().min(1, "Kebutuhan khusus harus diisi"),
	disabilitas: z.string().min(1, "Disabilitas harus diisi"),
	nama_ayah: z.string().min(1, "Nama ayah harus diisi"),
	nama_ibu: z.string().min(1, "Nama ibu harus diisi"),
	no_kip: z.union([z.string(), z.undefined()]).optional(), // Opsional dan bisa string atau undefined
	nama_wali: z.union([z.string(), z.undefined()]).optional(), // Mengatur no_kip sebagai opsional
	tempat_lahir: z.string().min(1, "Tempat lahir harus diisi"),
	jenis_kelamin: z.enum(["Laki-Laki", "Perempuan"], {
		errorMap: () => ({ message: "Jenis kelamin harus dipilih." }),
	}),
	nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
});

// Komponen untuk merender field form secara dinamis
const RenderFormField = ({
	fieldConfig,
	control,
	commonInputClass,
	isLoading,
}) => {
	const {
		name,
		label,
		placeholder,
		fieldType,
		options,
		type,
		description,
		disabled,
		icon: Icon,
		className,
		accept,
		multiple,
		rows,
	} = fieldConfig;

	// Menambahkan tanda bintang untuk field yang wajib diisi
	const isRequired =
		roleFormSchema.shape[name] && !roleFormSchema.shape[name].isOptional();

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn(className)}>
					<FormLabel className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center">
						{Icon && (
							<Icon className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500 opacity-80" />
						)}
						{label}
						{isRequired && <span className="text-red-500 ml-1">*</span>}
					</FormLabel>
					<FormControl>
						{fieldType === "select" ? (
							<Select
								onValueChange={field.onChange}
								value={field.value || ""}
								defaultValue={field.value}
								disabled={disabled || isLoading}
							>
								<SelectTrigger
									className={cn(
										"w-full",
										commonInputClass,
										(disabled || isLoading) && "opacity-70 cursor-not-allowed"
									)}
								>
									<SelectValue placeholder={placeholder || "Pilih opsi..."} />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
									{options?.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value.toString()}
											className="hover:bg-emerald-50 dark:hover:bg-slate-700"
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						) : fieldType === "textarea" ? (
							<Textarea
								placeholder={placeholder}
								{...field}
								rows={rows || 3}
								className={cn(commonInputClass, "min-h-[100px]")}
								disabled={isLoading}
							/>
						) : fieldType === "file" ? (
							<Input
								type="file"
								accept={accept || "image/*"}
								multiple={multiple}
								onChange={(e) => field.onChange(e.target.files)}
								className={cn(
									commonInputClass,
									"pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
								)}
								disabled={isLoading}
							/>
						) : fieldType === "date" ? (
							<DatePicker
								value={field.value}
								onChange={field.onChange}
								placeholder={placeholder || "Pilih tanggal"}
								className={commonInputClass} // Pastikan DatePicker Anda menerima className
								disabled={isLoading}
							/>
						) : fieldType === "tel" ? (
							<PhoneInput
								value={field.value}
								onChange={field.onChange}
								placeholder={placeholder || "e.g., +628123456789"}
								className={commonInputClass} // Pastikan PhoneInput Anda menerima className
								disabled={isLoading}
							/>
						) : (
							<Input
								placeholder={placeholder}
								type={type || "text"}
								{...field}
								className={commonInputClass}
								disabled={isLoading}
							/>
						)}
					</FormControl>
					{description && (
						<FormDescription className="text-xs text-gray-500 dark:text-slate-400 mt-1">
							{description}
						</FormDescription>
					)}
					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	);
};

const PageTambahSiswa = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);

	const { kelas, loading: loadingKelass, error: kelasError } = useKelas();
	const {
		jurusan,
		loading: loadingJurusans,
		error: jurusanError,
	} = useJurusan();
	const { units, loading: loadingUnits, error: unitsError } = useUnits();

	const form = useForm({
		resolver: zodResolver(roleFormSchema),
		defaultValues: {
			nisn: "",
			id_kelas: "",
			id_jurusan: "",
			id_unit: "",
			role: "siswa",
			nama: "",
			email: "",
			password: "",
			telepon: "",
			tgl_lahir: "",
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
		},
	});

	const handleSubmit = async (values) => {
		setIsSubmitting(true);
		setSubmitError(null);
		try {
			const formData = new FormData();

			// Hanya append field yang memiliki nilai
			Object.keys(values).forEach((key) => {
				// Skip field yang undefined, null, atau empty string (kecuali untuk field tertentu)
				if (values[key] === undefined || values[key] === null) return;

				// Handle file upload
				if (key === "gambar" && values.gambar instanceof File) {
					formData.append("gambar", values.gambar);
				}
				// Handle date
				else if (values[key] instanceof Date) {
					formData.append(key, values[key].toISOString().split("T")[0]);
				}
				// Handle empty string for optional fields
				else if (values[key] === "" && ["no_kip", "nama_wali"].includes(key)) {
					// Skip appending empty optional fields
				}
				// Handle other fields
				else {
					formData.append(key, values[key]);
				}
			});

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/register-siswa`,
				{ method: "POST", body: formData }
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message ||
						"Gagal menambahkan siswa. Periksa kembali data Anda."
				);
			}

			toast.success("Siswa berhasil ditambahkan!");
			form.reset();
		} catch (error) {
			console.error("Error submitting form:", error);
			setSubmitError(error.message || "Terjadi kesalahan. Silakan coba lagi.");
			toast.error(error.message || "Gagal menambahkan siswa.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const commonInputClass =
		"bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-100 rounded-lg shadow-sm text-sm";

	const formFieldsConfig = [
		{
			fieldType: "separator",
			label: "Informasi Pribadi Siswa",
			className: "md:col-span-2 pt-2",
		},
		{
			name: "nama",
			label: "Nama Lengkap",
			placeholder: "Masukkan nama lengkap",
			icon: User,
		},
		{ name: "nisn", label: "NISN", placeholder: "Masukkan NISN", icon: Hash },
		{ name: "nik", label: "NIK", placeholder: "16 digit NIK", icon: Info },
		{
			name: "email",
			label: "Email",
			placeholder: "contoh@email.com",
			type: "email",
			icon: Mail,
		},
		{
			name: "password",
			label: "Password Akun",
			placeholder: "Minimal 6 karakter",
			type: "password",
			icon: KeyRound,
		},
		{
			name: "telepon",
			label: "Nomor Telepon",
			placeholder: "628xxxxxxxxxx",
			fieldType: "tel",
			icon: Phone,
		},
		{
			name: "tempat_lahir",
			label: "Tempat Lahir",
			placeholder: "Kota kelahiran",
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

		{
			fieldType: "separator",
			label: "Informasi Akademik",
			className: "md:col-span-2 mt-5",
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
			description: "Otomatis diatur sebagai Siswa.",
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

		{
			fieldType: "separator",
			label: "Informasi Tambahan",
			className: "md:col-span-2 mt-5",
		},
		{
			name: "no_kip",
			label: "No. KIP (Opsional)",
			placeholder: "Masukkan No. KIP jika ada",
			icon: Paperclip,
		},
		{
			name: "kebutuhan_khusus",
			label: "Kebutuhan Khusus",
			fieldType: "select",
			options: [
				{ value: "Tidak Ada", label: "Tidak Ada" },
				{ value: "Ada", label: "Ada" },
			],
			icon: Info,
		},
		{
			name: "disabilitas",
			label: "Disabilitas",
			fieldType: "select",
			options: [
				{ value: "Tidak Ada", label: "Tidak Ada" },
				{ value: "Ada", label: "Ada" },
			],
			icon: Info,
		},

		{
			fieldType: "separator",
			label: "Data Orang Tua / Wali",
			className: "md:col-span-2 mt-5",
		},
		{
			name: "nama_ayah",
			label: "Nama Ayah",
			placeholder: "Nama lengkap ayah",
			icon: UserSquare,
		},
		{
			name: "nama_ibu",
			label: "Nama Ibu",
			placeholder: "Nama lengkap ibu",
			icon: UserSquare,
		},
		{
			name: "nama_wali",
			label: "Nama Wali (Opsional)",
			placeholder: "Nama lengkap wali jika ada",
			icon: UserSquare,
		},

		{
			fieldType: "separator",
			label: "Foto Profil",
			className: "md:col-span-2 mt-5",
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
		<div className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
			<Card className="max-w-5xl mx-auto shadow-2xl rounded-2xl border border-gray-200/80">
				<CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-2xl">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl font-bold text-white">
								Formulir Pendaftaran Siswa Baru
							</CardTitle>
							<CardDescription className="text-emerald-100 mt-1">
								Lengkapi semua informasi yang diperlukan dengan benar.
							</CardDescription>
						</div>
						<Link href="/dashboard/siswa">
							<Button
								variant="outline"
								size="sm"
								className="bg-white/20 text-white hover:bg-white/30 border-white/50"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Kembali ke Daftar Siswa
							</Button>
						</Link>
					</div>
				</CardHeader>
				<CardContent className="p-6 md:p-8">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
						>
							{formFieldsConfig.map((fieldConfig) => {
								if (fieldConfig.fieldType === "separator") {
									return (
										<div
											key={fieldConfig.label || Math.random()}
											className={cn(
												"md:col-span-2 pt-4 pb-2",
												fieldConfig.className
											)}
										>
											<h3 className="text-xl font-semibold text-emerald-700 mb-2 flex items-center">
												{/* Bisa tambahkan ikon untuk separator jika mau */}
												{fieldConfig.label}
											</h3>
											<Separator className="bg-emerald-200" />
										</div>
									);
								}
								return (
									<RenderFormField
										key={fieldConfig.name}
										fieldConfig={fieldConfig}
										control={form.control}
										commonInputClass={commonInputClass}
										isLoading={
											isSubmitting ||
											loadingKelass ||
											loadingJurusans ||
											loadingUnits
										}
									/>
								);
							})}

							{submitError && (
								<div className="md:col-span-2">
									<Alert
										variant="destructive"
										className="bg-red-50 border-red-300 text-red-700"
									>
										<AlertCircle className="h-4 w-4" />
										<AlertTitle>Gagal Menyimpan</AlertTitle>
										<AlertDescription>{submitError}</AlertDescription>
									</Alert>
								</div>
							)}

							<div className="md:col-span-2 flex justify-end pt-6 mt-4 border-t border-gray-200">
								<Button
									type="submit"
									className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/40 px-8 py-3 text-base rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									) : (
										<CheckCircle2 className="mr-2 h-5 w-5" />
									)}
									{isSubmitting ? "Menyimpan Data..." : "Simpan Data Siswa"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default PageTambahSiswa;

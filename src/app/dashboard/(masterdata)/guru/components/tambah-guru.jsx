import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useRoles } from "@/hooks/useRole";

const roleFormSchema = z.object({
	id_role: z.string().min(1, "ID role harus diisi"),
	nama: z.string().min(1, "Nama role harus diisi"),
	email: z.string().email("Email tidak valid"),
	password: z.string().min(6, "Password minimal 6 karakter"),
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

const TambahGuru = ({ onSuccess }) => {
	const { roles, loading: loadingRoles, error: rolesError } = useRoles();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

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
			triggerText="Tambah Guru"
			dialogTitle="Tambah Guru"
			dialogDescription="Tambahkan guru baru."
			formSchema={roleFormSchema}
			defaultValues={{
				id_role: "",
				nama: "",
				email: "",
				password: "",
				telepon: "",
				tgl_lahir: "",
				alamat: "",
				status: "on",
				gambar: "",
			}}
			fields={[
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
					description: "Masukkan tanggal lahir guru",
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
					description: "Unggah gambar profil guru",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default TambahGuru;

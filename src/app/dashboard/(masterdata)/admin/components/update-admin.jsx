import { z } from "zod";
import GenericFormDialog from "@/components/input-form/text-input";
import { useRoles } from "@/hooks/useRole";

const roleFormSchema = z.object({
	id_role: z.string().min(1, "ID role harus diisi"),
	nama: z.string().min(1, "Nama role harus diisi"),
	email: z.string().email("Email tidak valid"),
	password: z.string().optional(),
	telepon: z
		.string()
		.min(10, "Nomor telepon minimal 10 digit")
		.max(15, "Nomor telepon maksimal 15 digit")
		.regex(/^\+?\d+$/, "Format nomor telepon tidak valid"),
	tgl_lahir: z.any(),
	alamat: z.string().min(1, "Alamat harus diisi"),
	status: z.enum(["on", "off"]),
	gambar: z.string().optional(),
});

const UpdateAdmin = ({ onSuccess, id, rowData }) => {
	const { roles, loading: loadingRoles, error: rolesError } = useRoles();

	const handleSubmit = async (values) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/akun/${id}`,
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
			dialogTitle="Update Admin"
			dialogDescription="Updatekan admin baru."
			formSchema={roleFormSchema}
			defaultValues={{
				id_role: rowData.id_role?.toString() || "",
				nama: rowData.nama || "",
				email: rowData.email || "",
				password: "",
				telepon: rowData.telepon || "",
				tgl_lahir: rowData.tgl_lahir || "",
				alamat: rowData.alamat || "",
				status: rowData.status || "on",
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
					description: "Masukkan tanggal lahir admin",
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
					description: "Unggah gambar profil admin",
				},
			]}
			onSubmit={handleSubmit}
			onSuccess={onSuccess}
		/>
	);
};

export default UpdateAdmin;

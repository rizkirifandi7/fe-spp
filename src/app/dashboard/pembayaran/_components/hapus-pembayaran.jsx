import { getCookie } from "@/actions/cookies";
import DeleteDialog from "@/components/input-form/hapus-input";
import axios from "axios";

const HapusPembayaran = ({ id, onSuccess }) => {
	const deleteAction = async (id) => {
		const token = (await getCookie("token"))?.value;
		if (!token) {
			throw new Error("Token tidak ditemukan. Silakan login ulang.");
		}
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/tagihan/${id}`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	};

	return (
		<DeleteDialog
			id={id}
			entityName="Tagihan"
			onSuccess={onSuccess}
			deleteFn={deleteAction}
			triggerVariant="icon" // atau "text" atau "both"
			description="Apakah Anda yakin ingin menghapus tagihan ini? Data yang terkait juga akan terpengaruh."
		/>
	);
};

export default HapusPembayaran;

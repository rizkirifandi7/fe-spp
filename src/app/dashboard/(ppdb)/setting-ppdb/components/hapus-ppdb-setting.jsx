import DeleteDialog from "@/components/input-form/hapus-input";
import axios from "axios";

const HapusSettingPPDB = ({ id, onSuccess }) => {
	const deleteAction = async (id) => {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/ppdb-pembayaran/${id}`
		);
		return response.data;
	};

	return (
		<DeleteDialog
			id={id}
			entityName="Kelas"
			onSuccess={onSuccess}
			deleteFn={deleteAction}
			triggerVariant="icon" // atau "text" atau "both"
			description="Apakah Anda yakin ingin menghapus kelas ini? Data yang terkait juga akan terpengaruh."
		/>
	);
};

export default HapusSettingPPDB;

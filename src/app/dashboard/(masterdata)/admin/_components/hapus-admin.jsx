import DeleteDialog from "@/components/input-form/hapus-input";
import axios from "axios";

const HapusAdmin = ({ id, onSuccess }) => {
	const deleteAction = async (id) => {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/akun/${id}`
		);
		return response.data;
	};

	return (
		<DeleteDialog
			id={id}
			entityName="Akun"
			onSuccess={onSuccess}
			deleteFn={deleteAction}
			triggerVariant="icon" // atau "text" atau "both"
			description="Apakah Anda yakin ingin menghapus akun ini? Data yang terkait juga akan terpengaruh."
		/>
	);
};

export default HapusAdmin;

import DeleteDialog from "@/components/input-form/hapus-input";
import axios from "axios";

const HapusRole = ({ id, onSuccess }) => {
	const deleteAction = async (id) => {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/role/${id}`
		);
		return response.data;
	};

	return (
		<DeleteDialog
			id={id}
			entityName="Role"
			onSuccess={onSuccess}
			deleteFn={deleteAction}
			triggerVariant="icon" // atau "text" atau "both"
			description="Apakah Anda yakin ingin menghapus role ini? Data yang terkait juga akan terpengaruh."
		/>
	);
};

export default HapusRole;

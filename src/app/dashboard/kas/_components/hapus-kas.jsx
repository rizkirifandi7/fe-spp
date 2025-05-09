import DeleteDialog from "@/components/input-form/hapus-input";
import axios from "axios";

const HapusKas = ({ id, onSuccess, onDataAdded }) => {
	const deleteAction = async (id) => {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/kas/${id}`
		);

		return response.data;
	};

	return (
		<DeleteDialog
			id={id}
			entityName="Kas"
			onDataAdded={onDataAdded}
			onSuccess={onSuccess}
			deleteFn={deleteAction}
			triggerVariant="icon" // atau "text" atau "both"
			description="Apakah Anda yakin ingin menghapus kas ini? Data yang terkait juga akan terpengaruh."
		/>
	);
};

export default HapusKas;

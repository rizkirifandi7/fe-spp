import DeleteDialog from "@/components/input-form/hapus-input";
import axios from "axios";

const HapusPPDB = ({ id, onSuccess, onDataAdded }) => {
	const deleteAction = async (id) => {
		const response = await axios.delete(
			`${process.env.NEXT_PUBLIC_API_URL}/daftar-ppdb/${id}`
		);
		return response.data;
	};

	return (
		<DeleteDialog
			id={id}
			entityName="Data PPDB"
			onDataAdded={onDataAdded}
			onSuccess={onSuccess}
			deleteFn={deleteAction}
			triggerVariant="icon" // atau "text" atau "both"
			description="Apakah Anda yakin ingin menghapus data PPDB ini? Data yang terkait juga akan terpengaruh."
		/>
	);
};

export default HapusPPDB;

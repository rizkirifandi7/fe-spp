// hooks/useJenisPembayaran.js
import { useState, useEffect } from "react";

export const useJenisPembayaran = () => {
	const [jenisPembayaran, setJenisPembayaran] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchJenisPembayaran = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/jenis-pembayaran`
			);

			if (!response.ok) {
				throw new Error("Gagal mengambil data jenis-pembayaran");
			}

			const data = await response.json();
			setJenisPembayaran(data.data || []);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching jenisPembayaran:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchJenisPembayaran();
	}, []);

	return { jenisPembayaran, loading, error, refetch: fetchJenisPembayaran };
};

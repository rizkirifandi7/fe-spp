// hooks/useKelas.js
import { useState, useEffect } from "react";

export const useKelas = () => {
	const [kelas, setKelas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchKelas = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas`);

			if (!response.ok) {
				throw new Error("Gagal mengambil data kelas");
			}

			const data = await response.json();
			setKelas(data.data || []);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching kelas:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchKelas();
	}, []);

	return { kelas, loading, error, refetch: fetchKelas };
};

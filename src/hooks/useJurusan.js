// hooks/useJurusan.js
import { useState, useEffect } from "react";

export const useJurusan = () => {
	const [jurusan, setJurusan] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchJurusan = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/jurusan`
			);

			if (!response.ok) {
				throw new Error("Gagal mengambil data jurusan");
			}

			const data = await response.json();
			setJurusan(data.data || []);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching jurusan:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchJurusan();
	}, []);

	return { jurusan, loading, error, refetch: fetchJurusan };
};

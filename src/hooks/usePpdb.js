// hooks/usePpdbs.js
import { useState, useEffect } from "react";

export const usePpdbs = () => {
	const [ppdbs, setPpdbs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchPpdbs = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/ppdb-pembayaran`
			);

			if (!response.ok) {
				throw new Error("Gagal mengambil data unit");
			}

			const data = await response.json();
			setPpdbs(data.data || []);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching ppdbs:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPpdbs();
	}, []);

	return { ppdbs, loading, error, refetch: fetchPpdbs };
};

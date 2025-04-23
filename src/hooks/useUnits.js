// hooks/useUnits.js
import { useState, useEffect } from "react";

export const useUnits = () => {
	const [units, setUnits] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchUnits = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unit`);

			if (!response.ok) {
				throw new Error("Gagal mengambil data unit");
			}

			const data = await response.json();
			setUnits(data.data || []);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching units:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUnits();
	}, []);

	return { units, loading, error, refetch: fetchUnits };
};

// hooks/useRoles.js
import { useState, useEffect } from "react";

export const useRoles = () => {
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchRoles = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role`);

			if (!response.ok) {
				throw new Error("Gagal mengambil data role");
			}

			const data = await response.json();
			setRoles(data.data || []);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching roles:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRoles();
	}, []);

	return { roles, loading, error, refetch: fetchRoles };
};
